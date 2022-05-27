use crate::error::Error;
use crate::model::{FeedInfo, SourceFeed};
use crate::util::feed_merger::FeedMerger;
use crate::util::feed_parser::FeedDocument;

type Result<T> = std::result::Result<T, Error>;

mod feed_merger;
mod feed_parser;

pub async fn fetch_rss_info(url: &str, _limit: usize) -> Result<FeedInfo> {
    let resp = reqwest::get(url).await?;
    let text = resp.bytes().await?;
    let doc = FeedDocument::parse(text.as_ref())?;
    let feed_info = doc.read_info()?;
    Ok(feed_info)
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
