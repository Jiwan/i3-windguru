mod windguru;
mod i3status;
mod output;

use tokio::prelude::*;

#[tokio::main]
async fn main() {
    let mut output = output::Output::new().await;
    let mut i3_status = i3status::I3Status::new().await;
    let windguru = windguru::Windguru::new(1322);

    let mut windguru_sender = output.sender.clone();
    tokio::spawn(async move {
        windguru.start_fetch_loop(&mut windguru_sender).await;
    });

    let mut i3_status_sender = output.sender.clone();
    tokio::spawn(async move { 
        i3_status.start_read_loop(&mut i3_status_sender).await;
    });

    output.start_pump_loop().await;
}