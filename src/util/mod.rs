use anyhow::Result;
use rocket::http::hyper::body::Buf;
use rocket::serde::json::Json;

use crate::model::FeedInfo;

mod feed_parser;

pub async fn fetch_rss_info(url: &str) -> Result<Json<FeedInfo>> {
    let resp = reqwest::get(url).await?;
    let text = resp.bytes().await?;
    let feed_info = feed_parser::FeedParser::new(text.reader()).parse()?;
    Ok(Json(feed_info))
}
