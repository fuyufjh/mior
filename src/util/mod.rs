use std::time::Instant;

use futures::future::try_join_all;
use futures::TryFutureExt;
use rand::Rng;

use crate::error::{Error, Result};
use crate::model::{FeedInfo, SourceFeed};
use crate::util::feed_merger::FeedMerger;
use crate::util::feed_parser::FeedDocument;

mod feed_merger;
mod feed_parser;

pub async fn fetch_rss_info(url: &str, limit: usize) -> Result<FeedInfo> {
    const USER_AGENT: &str = concat!(env!("CARGO_PKG_NAME"), "/", env!("CARGO_PKG_VERSION"));
    let client = reqwest::Client::builder().user_agent(USER_AGENT).build()?;
    let resp = client.get(url).send().await?;

    if resp.status().is_success() {
        let data = resp.bytes().await?;
        let doc = FeedDocument::parse(data.as_ref())?.with_limit(limit);
        let feed_info = doc.read_feed()?;
        Ok(feed_info)
    } else {
        Err(Error::FetchFeedStatus(resp.status()))
    }
}

pub async fn merge_feeds_data(feeds: &[SourceFeed], limit: usize) -> Result<Vec<u8>> {
    let mut merger = FeedMerger::new();

    let start_time = Instant::now();
    let futures = feeds
        .iter()
        .map(|feed| reqwest::get(&feed.url).and_then(|resp| resp.bytes()));
    let responses = try_join_all(futures).await?;

    info_!("Fetching {} feeds costs {:?}", feeds.len(), start_time.elapsed());

    for (feed, text) in feeds.iter().zip(responses.iter()) {
        let keywords = split_keywords(&feed.keywords);
        let doc = FeedDocument::parse(text.as_ref())?
            .with_keywords(keywords)
            .with_limit(limit);
        merger.append(doc)?;
    }
    let out = merger.build();
    Ok(out)
}

fn split_keywords(keywords: &str) -> Vec<String> {
    keywords
        .split(' ')
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
