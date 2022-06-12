use xmltree::{Element, XMLNode};

use crate::error::MalformedFeedError;
use crate::model::{FeedInfo, FeedItem, FeedMeta};

pub type Result<T> = std::result::Result<T, MalformedFeedError>;

#[derive(Debug)]
pub struct FeedDocument {
    root_node: Element,

    limit: usize,

    keywords: Vec<String>,
}

impl FeedDocument {
    pub fn parse(data: &[u8]) -> Result<Self> {
        let root_node = Element::parse(data)?;
        if root_node.name != "rss" {
            return Err(MalformedFeedError::TagNotFound("rss"));
        }
        Ok(Self {
            root_node,
            limit: usize::MAX,
            keywords: Vec::new(),
        })
    }

    pub fn with_limit(mut self, limit: usize) -> Self {
        self.limit = limit;
        self
    }

    pub fn with_keywords(mut self, keywords: Vec<String>) -> Self {
        self.keywords = keywords;
        self
    }

    pub fn read_feed(&self) -> Result<FeedInfo> {
        let node_channel = self
            .root_node
            .get_child("channel")
            .ok_or(MalformedFeedError::TagNotFound("channel"))?;

        let meta = Self::read_meta(node_channel)?;
        let items = node_channel
            .children
            .iter()
            .flat_map(|node| match node {
                XMLNode::Element(e) if e.name == "item" => Some(e),
                _ => None,
            })
            .filter(|e| self.filter_by_keywords(e))
            .take(self.limit)
            .map(Self::read_item)
            .try_collect()?;

        Ok(FeedInfo { meta, items })
    }

    fn read_meta(node_channel: &Element) -> Result<FeedMeta> {
        let title = node_channel
            .get_child("title")
            .ok_or(MalformedFeedError::TagNotFound("title"))?
            .get_text()
            .ok_or(MalformedFeedError::InvalidTag("title"))?
            .into_owned();
        Ok(FeedMeta { title })
    }

    fn read_item(node_item: &Element) -> Result<FeedItem> {
        let title = node_item
            .get_child("title")
            .ok_or(MalformedFeedError::TagNotFound("title"))?
            .get_text()
            .ok_or(MalformedFeedError::InvalidTag("title"))?
            .into_owned();
        let link = node_item
            .get_child("link")
            .ok_or(MalformedFeedError::TagNotFound("link"))?
            .get_text()
            .ok_or(MalformedFeedError::InvalidTag("link"))?
            .into_owned();
        Ok(FeedItem { title, link })
    }

    pub fn into_item_nodes(mut self) -> Result<Vec<XMLNode>> {
        let node_channel = self
            .root_node
            .take_child("channel")
            .ok_or(MalformedFeedError::TagNotFound("channel"))?;

        let items: Vec<_> = node_channel
            .children
            .into_iter()
            .flat_map(|node| match node {
                XMLNode::Element(ref e) if e.name == "item" => Some(node),
                _ => None,
            })
            .filter(|node| {
                if let XMLNode::Element(ref e) = node {
                    self.filter_by_keywords(e)
                } else {
                    unreachable!()
                }
            })
            .take(self.limit)
            .collect();

        Ok(items)
    }

    fn filter_by_keywords(&self, e: &Element) -> bool {
        if self.keywords.is_empty() {
            return true;
        }
        if let Some(c) = e.get_child("title") {
            if let Some(t) = c.get_text() {
                return self.keywords.iter().all(|w| t.contains(w));
            }
        }
        // Simply returns false for elements without title
        return false;
    }
}

#[cfg(test)]
mod tests {
    use std::fs;

    use rocket::serde::json::serde_json;

    use super::*;

    const PATH: &str = "./src/tests/data/";

    macro_rules! test_case {
        ($name:literal, $test_func:ident) => {
            #[test]
            fn $test_func() {
                test_xml($name)
            }
        };
    }

    test_case!("1", test_xml_1);
    test_case!("2", test_xml_2);
    test_case!("3", test_xml_3);
    test_case!("4", test_xml_4);
    test_case!("5", test_xml_5);

    fn test_xml(name: &str) {
        let result = {
            let data = fs::read_to_string(format!("{PATH}/{name}.xml")).unwrap();
            let feed_info = FeedDocument::parse(data.as_bytes())
                .unwrap()
                .with_limit(20)
                .read_feed()
                .unwrap();
            serde_json::to_string_pretty(&feed_info).unwrap()
        };

        // Uncomment following lines to generate result files
        // {
        //     use std::fs::File;
        //     use std::io::{BufWriter, Write};
        //     let file = File::create(format!("{PATH}/{name}.result.json")).unwrap();
        //     let mut writer = BufWriter::new(file);
        //     writer.write_all(result.as_bytes()).unwrap();
        //     writer.flush().unwrap();
        // }

        let expected = fs::read_to_string(format!("{PATH}/{name}.result.json")).unwrap();
        assert_eq!(expected, result);
    }
}
