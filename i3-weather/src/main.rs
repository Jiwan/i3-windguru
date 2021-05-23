mod i3status;
mod output;
mod windguru;

#[tokio::main]
async fn main() {
    let mut output = output::Output::new().await;
    let mut i3_status = i3status::I3Status::new().await;
    let windguru = windguru::Windguru::new(1322);

    let channel = output.acquire_channel();
    let (mut slideshow, mut windguru_channel) = output::create_slideshow(channel);
    tokio::spawn(async move {
        windguru.start_fetch_loop(&mut windguru_channel).await;
    });

    tokio::spawn(async move {
        slideshow.start_forward_loop().await;
    });

    let mut i3_status_channel = output.acquire_channel();
    tokio::spawn(async move {
        i3_status.start_read_loop(&mut i3_status_channel).await;
    });

    output.start_pump_loop().await;
}
