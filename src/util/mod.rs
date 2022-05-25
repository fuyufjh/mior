use anyhow::Result;
use xmltree::{Element, XMLNode};

use crate::model::FeedInfo;
use crate::util::feed_merger::FeedMerger;
use crate::util::feed_parser::FeedDocument;

mod feed_merger;
mod feed_parser;

pub async fn fetch_rss_info(url: &str, _limit: usize) -> Result<FeedInfo> {
    let resp = reqwest::get(url).await?;
    let text = resp.bytes().await?;
    let doc = FeedDocument::parse(text.as_ref())?;
    let feed_info = doc.read_info()?;
    Ok(feed_info)
}

pub async fn merge_feeds_data(urls: Vec<&str>) -> Result<Vec<u8>> {
    let mut merger = FeedMerger::new();
    for url in urls {
        let resp = reqwest::get(url).await?;
        let text = resp.bytes().await?;
        let doc = FeedDocument::parse(text.as_ref())?;
        merger.append(doc)?;
    }
    let out = merger.build()?;
    Ok(out)
}
