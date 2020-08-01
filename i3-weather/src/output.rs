use tokio::sync::mpsc;
use tokio::io::{AsyncWriteExt};

pub type Sender = mpsc::Sender::<serde_json::map::Map<String, serde_json::Value>>;

pub struct Output {
    pub sender : Sender,
    receiver : mpsc::Receiver::<serde_json::map::Map<String, serde_json::Value>>,
    stdout : tokio::io::Stdout,
    state : <(String, String), serde_json::Value>
}

impl Output {
    pub async fn new() -> Self {
        let mut stdout = tokio::io::stdout();
        stdout.write_all(b"{\"version\":1}\n[\n").await.unwrap();
        
        let (sender, receiver) = mpsc::channel::<serde_json::map::Map<String, serde_json::Value>>(100);
        Output{sender, receiver, stdout, state: serde_json::map::Map::new()}
    }

    pub async fn start_pump_loop(&mut self) {
        while let Some(json) = self.receiver.recv().await {
            self.stdout.write_all(std::format!("{:?}", json).as_bytes()).await.unwrap();
            self.stdout.write_all(b"\n").await.unwrap();
        }
    }
}