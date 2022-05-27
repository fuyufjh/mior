use rocket::serde::{Deserialize, Serialize};

/// One article in RSS Feed
#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct FeedItem {
    pub title: String,
    pub link: String,
}

/// Metadata of Feed
#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct FeedMeta {
    pub title: String,
}

/// Metadata and items of Feed
#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct FeedInfo {
    pub meta: FeedMeta,
    pub items: Vec<FeedItem>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(crate = "rocket::serde")]
pub struct SourceFeed {
    #[serde(skip_deserializing, skip_serializing_if = "Option::is_none")]
    pub id: Option<i64>,
    pub name: String,
    pub url: String,
    pub keywords: String,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct User {
    #[serde(skip_deserializing, skip_serializing_if = "Option::is_none")]
    pub id: Option<i64>,
    pub nickname: String,
    pub email: String,
    #[serde(skip_deserializing, skip_serializing_if = "Option::is_none")]
    pub password: Option<String>,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct LoginForm {
    pub email: String,
    pub password: String,
}
