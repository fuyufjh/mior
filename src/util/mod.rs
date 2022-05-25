use std::io::Cursor;

use anyhow::Result;
use rocket::http::hyper::body::Buf;
use xmltree::{Element, XMLNode};

use crate::model::FeedInfo;
use crate::util::feed_parser::FeedDocument;

mod feed_merger;
mod feed_parser;

pub async fn fetch_rss_info(url: &str, limit: usize) -> Result<FeedInfo> {
    let resp = reqwest::get(url).await?;
    let text = resp.bytes().await?;
    let doc = FeedDocument::parse(text.as_ref())?;
    let feed_info = doc.read_info()?;
    Ok(feed_info)
}

pub async fn merge_feeds_data(urls: Vec<&str>) -> Result<Vec<u8>> {
    let mut node_channel = Element::new("channel");

    for url in urls {
        let resp = reqwest::get(url).await?;
        let text = resp.bytes().await?;
        let mut doc = FeedDocument::parse(text.as_ref())?;
        node_channel.children.append(&mut doc.into_item_nodes()?)
    }

    let mut root = Element::new("rss");
    root.children.push(XMLNode::Element(node_channel));

    let mut buf = Vec::new();
    root.write(&mut buf)?;

    Ok(buf)
}
