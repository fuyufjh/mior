use serde::{Serialize, Deserialize};

/// One article in RSS Feed
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct FeedItem {
    pub title: String,
    pub link: String,
}

/// Metadata of Feed
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct FeedMeta {
    pub title: String,
}

/// Metadata and items of Feed
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct FeedInfo {
    pub meta: FeedMeta,
    pub items: Vec<FeedItem>,
}
