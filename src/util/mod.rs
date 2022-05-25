use std::io::Cursor;

use anyhow::Result;
use feed_merger::FeedSource;
use rocket::http::hyper::body::Buf;

use crate::model::FeedInfo;
use crate::util::feed_parser_v2::FeedDocument;

mod feed_merger;
mod feed_parser_v2;

pub async fn fetch_rss_info(url: &str, limit: usize) -> Result<FeedInfo> {
    let resp = reqwest::get(url).await?;
    let text = resp.bytes().await?;
    let doc = FeedDocument::parse(text.as_ref())?;
    let feed_info = doc.read_info()?;
    Ok(feed_info)
}

pub async fn merge_feeds_data(urls: Vec<&str>) -> Result<Vec<u8>> {
    let mut out = Cursor::new(Vec::new());
    for url in urls {
        let resp = reqwest::get(url).await?;
        let text = resp.bytes().await?;
        let mut source = FeedSource::new(text.reader(), &mut out);
        loop {
            if !source.read_one_item()? {
                break;
            }
        }
    }
    Ok(out.into_inner())
}
