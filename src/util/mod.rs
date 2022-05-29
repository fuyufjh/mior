use rand::Rng;

use crate::error::{Error, Result};
use crate::model::{FeedInfo, SourceFeed};
use crate::util::feed_merger::FeedMerger;
use crate::util::feed_parser::FeedDocument;

mod feed_merger;
mod feed_parser;

pub async fn fetch_rss_info(url: &str, _limit: usize) -> Result<FeedInfo> {
    const USER_AGENT: &str = concat!(env!("CARGO_PKG_NAME"), "/", env!("CARGO_PKG_VERSION"));
    let client = reqwest::Client::builder().user_agent(USER_AGENT).build()?;
    let resp = client.get(url).send().await?;

    if resp.status().is_success() {
        let data = resp.bytes().await?;
        let doc = FeedDocument::parse(data.as_ref())?;
        let feed_info = doc.read_info()?;
        Ok(feed_info)
    } else {
        Err(Error::FetchFeedStatus(resp.status()))
    }
}

pub async fn merge_feeds_data(feeds: &[SourceFeed]) -> Result<Vec<u8>> {
    let mut merger = FeedMerger::new();
    for feed in feeds {
        let resp = reqwest::get(&feed.url).await?;
        let text = resp.bytes().await?;
        let keywords = split_keywords(&feed.keywords);
        let doc = FeedDocument::parse(text.as_ref())?.with_keywords(keywords);
        merger.append(doc)?;
    }
    let out = merger.build();
    Ok(out)
}

fn split_keywords(keywords: &str) -> Vec<String> {
    keywords
        .split(" ")
        .filter(|s| !s.is_empty())
        .map(|s| s.to_owned())
        .collect()
}

pub fn gen_rand_token() -> String {
    let bytes: Vec<u8> = rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(16)
        .collect();
    String::from_utf8(bytes).unwrap()
}
