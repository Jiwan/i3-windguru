use serde_json::Value::Object;
use tokio::process::ChildStdout;
use std::process::{Stdio};
use tokio::process::{Command, Child};
use tokio::io::{BufReader, AsyncBufReadExt};
use tokio::runtime::Runtime;
use crate::output::{Sender};

const I3STATUS_COMMAND : &str = "i3status"; 

pub struct I3Status {
    i3status_process : Child,
    buf_reader : BufReader<ChildStdout>, 
}

impl I3Status {
    pub async fn new() -> Self {
        let mut i3status_process = Command::new(I3STATUS_COMMAND)
            .stdout(Stdio::piped())
            .kill_on_drop(true)
            .spawn()
            .expect("Failed to start i3status process");

        let stdout = i3status_process.stdout.take().expect("Could not grab output from i3status");
        let mut buf_reader = BufReader::new(stdout);
    
        let mut header_string = String::new();   
        let _ = buf_reader.read_line(&mut header_string).await;

        let header : serde_json::Value = serde_json::from_str(&header_string).expect("Could not get the header of i3status");
        assert_eq!(header["version"].as_u64(), Some(1));

        header_string.clear();
        let _ = buf_reader.read_line(&mut header_string).await;
        assert!(header_string.starts_with("["));

        I3Status{i3status_process, buf_reader : buf_reader}
    }

    pub async fn start_read_loop(&mut self, sender: &mut Sender) {
        loop {
            let mut string = String::new();   
            let _ = self.buf_reader.read_line(&mut string).await;
            let start_index = if string.starts_with(",") { 1 } else { 0 };

            let values : Vec<serde_json::Value> = serde_json::from_str(&string[start_index..string.len()]).unwrap();

            for value in values {
                if let Object(map) = value {
                    sender.send(map).await.unwrap();
                }
            }
        }
    }
}