use crypto::digest::Digest;
use itertools::Itertools;
use reqwest::{header, Client};
use serde::Deserialize;
use serde_json::json;
use std::fmt::format;
use tokio::sync::mpsc;
use tokio::time::{self, Duration};
use crate::output::UpdateMessage;

pub struct Windguru {
    client: Client,
    station: u64,
}

const USER_AGENT : &str = "Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36";
const WINDGURU_API: &str = "https://www.windguru.cz/int/iapi.php";

fn md5_for_query(query: &[(&str, &str)]) -> String {
    let encoded_string = query
        .iter()
        .map(|&(key, value)| format!("{}={}", key, value))
        .join("&");

    let full_query = format!("wgsec-{}", encoded_string.replace("+", " "));
    let mut md5 = crypto::md5::Md5::new();
    md5.input_str(&full_query);
    let md5_result = md5.result_str();
    md5_result[14..14 + 8].to_string()
}

#[derive(Deserialize, Debug)]
struct StationDataCurrent {
    wind_avg: f32,
    wind_max: f32,
    wind_min: f32,
    wind_direction: u16,
    temperature: f32,
    datetime: String,
    unixtime: u32,
}

pub fn status_smiley(wind_avg: f32) -> &'static str {
    if wind_avg < 8.0 {
        "😠"
    } else if wind_avg < 12.0 {
        "😊"
    } else if wind_avg < 22.0 {
        "🏄"
    } else {
        "💀"
    }
}

impl Windguru {
    pub fn new(station: u64) -> Self {
        let mut headers = header::HeaderMap::new();
        headers.insert(
            header::REFERER,
            format!("https://www.windguru.cz/station/{}", station)
                .parse()
                .unwrap(),
        );
        headers.insert(header::USER_AGENT, USER_AGENT.parse().unwrap());
        headers.insert(
            header::HeaderName::from_static("x-requested-with"),
            "XMLHttpRequest".parse().unwrap(),
        );

        let client = Client::builder()
            .default_headers(headers)
            .referer(false)
            .redirect(reqwest::redirect::Policy::none())
            .build()
            .unwrap();

        Windguru { client, station }
    }

    pub async fn start_fetch_loop(&self, channel: &mut mpsc::Sender::<Vec<UpdateMessage>>) {
        let mut request_interval = time::interval(Duration::from_secs(60));

        loop {
            request_interval.tick().await;

            let query = &[
                ("q", "station_data_current"),
                ("id_station", &self.station.to_string()),
                ("date_format", "Y-m-d H:i:s T"),
            ];

            let md5 = &[("_mha", md5_for_query(query))];

            let response = self
                .client
                .get(WINDGURU_API)
                .query(query)
                .query(md5)
                .send()
                .await;

            let mut windguru_update =
                json!([{"name" : "windguru", "markup": "none", "full_text": "error"}]);
            let mut messages = Vec::new();
            match response {
                Ok(body) => match body.json::<StationDataCurrent>().await {
                    Ok(data) => {
                        let text = format!(
                            "{smiley} Erstakvik: {}kts {smiley}",
                            data.wind_avg,
                            smiley = status_smiley(data.wind_avg)
                        );
                        windguru_update[0]["full_text"] = json!(text);
                        messages.push(windguru_update.as_array().unwrap().to_vec());

                        let text = format!(
                            "Max: {}kts - Min: {}kts Dir: {}",
                            data.wind_max, data.wind_min, data.wind_direction,
                        );
                        windguru_update[0]["full_text"] = json!(text);
                        messages.push(windguru_update.as_array().unwrap().to_vec());

                        let text = format!("Temp: {}°C", data.temperature);
                        windguru_update[0]["full_text"] = json!(text);
                        messages.push(windguru_update.as_array().unwrap().to_vec());
                    }
                    Err(err) => {
                        messages.push(windguru_update.as_array().unwrap().to_vec());
                        eprintln!("Error parsing result of windguru: {}", err)
                    }
                },
                Err(err) => {
                    messages.push(windguru_update.as_array().unwrap().to_vec());
                    eprintln!("Error while fecthing windguru data: {}", err);
                }
            }

            channel.send(messages).await.unwrap();
        }
    }
}
