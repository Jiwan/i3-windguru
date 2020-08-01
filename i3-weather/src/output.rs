use tokio::sync::mpsc;
use tokio::io::{AsyncWriteExt};
use itertools::{Itertools};

pub type UpdateMessage = Vec<serde_json::Value>; 
type IndexedUpdateMessage = (usize, UpdateMessage);

pub struct Output {
    sender : mpsc::Sender::<IndexedUpdateMessage>,
    receiver : mpsc::Receiver::<IndexedUpdateMessage>,
    stdout : tokio::io::Stdout,
    states : Vec<Vec<serde_json::Value>>
}

pub struct Channel {
    sender : mpsc::Sender::<IndexedUpdateMessage>,
    state_slot : usize  
}

impl Output {
    pub async fn new() -> Self {
        let mut stdout = tokio::io::stdout();
        stdout.write_all(b"{\"version\":1}\n[\n").await.unwrap();
        
        let (sender, receiver) = mpsc::channel(100);
        Output{sender, receiver, stdout, states: Vec::new()}
    }

    pub async fn start_pump_loop(&mut self) {
        while let Some((state_slot, json)) = self.receiver.recv().await {
            assert!(state_slot < self.states.len(), "Invalid slot");

            self.states[state_slot] = json; 

            self.stdout.write_all(b"[").await.unwrap();

            let result = self.states.iter()
                .filter(|state| !state.is_empty())
                .map(|state|{ state.iter().map(|object|{ object.to_string() }).join(",") }).join(",");
            self.stdout.write_all(result.as_bytes()).await.unwrap();
            self.stdout.write_all(b"],\n").await.unwrap();
        }
    }

    pub fn acquire_channel(&mut self) -> Channel {
        self.states.resize_with(self.states.len() + 1, Default::default);
        Channel{sender: self.sender.clone(), state_slot: self.states.len() -1 }
    }
}

impl Channel {
    pub async fn send_update_message(&mut self, message: UpdateMessage) {
        self.sender.send((self.state_slot, message)).await.unwrap();
    }
}