use itertools::Itertools;
use tokio::io::AsyncWriteExt;
use tokio::sync::mpsc;
use tokio::time::{self, Duration};

pub type UpdateMessage = Vec<serde_json::Value>;
type IndexedUpdateMessage = (usize, UpdateMessage);

pub struct Output {
    sender: mpsc::Sender<IndexedUpdateMessage>,
    receiver: mpsc::Receiver<IndexedUpdateMessage>,
    stdout: tokio::io::Stdout,
    states: Vec<Vec<serde_json::Value>>,
}

pub struct Channel {
    sender: mpsc::Sender<IndexedUpdateMessage>,
    state_slot: usize,
}

impl Output {
    pub async fn new() -> Self {
        let mut stdout = tokio::io::stdout();
        stdout.write_all(b"{\"version\":1}\n[\n").await.unwrap();
        let (sender, receiver) = mpsc::channel(100);
        Output {
            sender,
            receiver,
            stdout,
            states: Vec::new(),
        }
    }

    pub async fn start_pump_loop(&mut self) {
        while let Some((state_slot, json)) = self.receiver.recv().await {
            assert!(state_slot < self.states.len(), "Invalid slot");

            self.states[state_slot] = json;

            self.stdout.write_all(b"[").await.unwrap();

            let result = self
                .states
                .iter()
                .filter(|state| !state.is_empty())
                .map(|state| state.iter().map(|object| object.to_string()).join(","))
                .join(",");
            self.stdout.write_all(result.as_bytes()).await.unwrap();
            self.stdout.write_all(b"],\n").await.unwrap();
        }
    }

    pub fn acquire_channel(&mut self) -> Channel {
        self.states
            .resize_with(self.states.len() + 1, Default::default);
        Channel {
            sender: self.sender.clone(),
            state_slot: self.states.len() - 1,
        }
    }
}

impl Channel {
    pub async fn send_update_message(&mut self, message: UpdateMessage) {
        self.sender.send((self.state_slot, message)).await.unwrap();
    }
}

pub struct SlideShow {
    receiver: mpsc::Receiver<Vec<UpdateMessage>>,
    output_channel: Channel,
    messages: Vec<UpdateMessage>,
    index: usize,
}

impl SlideShow {
    pub async fn start_forward_loop(&mut self) {
        let mut request_interval = time::interval(Duration::from_secs(15));

        loop {
            request_interval.tick().await;

            if let Ok(messages) = self.receiver.try_recv() {
                self.messages = messages;
                self.index = 0;
            }

            if self.messages.is_empty() {
                continue;
            }

            self.output_channel
                .send_update_message(self.messages[self.index].clone())
                .await;
            self.index = (self.index + 1) % self.messages.len();
        }
    }
}

pub fn create_slideshow(output_channel: Channel) -> (SlideShow, mpsc::Sender<Vec<UpdateMessage>>) {
    let (sender, receiver) = mpsc::channel(100);
    let slideshow = SlideShow {
        receiver,
        output_channel,
        messages: Vec::new(),
        index: 0,
    };

    (slideshow, sender)
}
