use tokio::time::{self, Duration};
use reqwest::{Client, header};
use std::fmt::{format};
use crypto::digest::{Digest};
use itertools::{Itertools};
use serde::{Deserialize};
use crate::output::{Sender};

pub struct Windguru {
   client: Client,
   station : u64 
}

const USER_AGENT : &str = "Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36";
const WINDGURU_API : &str = "https://www.windguru.cz/int/iapi.php";

fn md5_for_query(query : &[(&str, &str)]) -> String {
    let encoded_string = query.iter().map(|&(key, value)|{ format!("{}={}", key, value) }).join("&"); 
    
    let full_query = format!("wgsec-{}",  encoded_string.replace("+", " "));

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
    temperature:f32,
    datetime: String,
    unixtime:u32
}

impl Windguru {
    pub fn new(station: u64) -> Self {
        let mut headers = header::HeaderMap::new();
        headers.insert(header::REFERER, format!("https://www.windguru.cz/station/{}", station).parse().unwrap());
        headers.insert(header::USER_AGENT, USER_AGENT.parse().unwrap()); 
        headers.insert(header::HeaderName::from_static("x-requested-with"), "XMLHttpRequest".parse().unwrap());

        let client = Client::builder()
            .default_headers(headers)
            .referer(false)
            .redirect(reqwest::redirect::Policy::none())
            .build()
            .unwrap();

        Windguru{client, station}
    }

    pub async fn start_fetch_loop(&self, sender : &mut Sender) {
        let mut interval = time::interval(Duration::from_secs(60));

        loop {
            interval.tick().await;

            let query = &[
                ("q", "station_data_current"),
                ("id_station", &self.station.to_string()),
                ("date_format", "Y-m-d H:i:s T"),
            ];

            let md5 = &[("_mha", md5_for_query(query))];

            let response = self.client
                .get(WINDGURU_API)
                .query(query)
                .query(md5)
                .send().await;

            if let Ok(body) = response {
                let stationDataCurrent = body.json::<StationDataCurrent>().await.unwrap();
                
                let mut dataToSend = serde_json::Map::new();
                dataToSend.insert("name".to_owned(), serde_json::Value::String("windguru".to_owned()));
                dataToSend.insert("markup".to_owned(), serde_json::Value::String("none".to_owned()));
                dataToSend.insert("full_text".to_owned(), serde_json::Value::String(std::format!("Wind Erstakvik: {}", stationDataCurrent.wind_avg)));
                sender.send(dataToSend).await.unwrap();
            }
        }

    }

}