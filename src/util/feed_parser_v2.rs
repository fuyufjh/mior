use std::fmt::Formatter;
use std::io::{BufRead, Read};
use std::{error, fmt};

use anyhow::{anyhow, Context, Result};
use quick_xml::events::Event;
use quick_xml::{Error, Reader};
use rocket::http::ext::IntoCollection;
use xmltree::{Element, XMLNode};

use crate::model::{FeedInfo, FeedItem, FeedMeta};

#[derive(Debug, Clone)]
struct TagNotFoundError(&'static str);

impl fmt::Display for TagNotFoundError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "tag <{}> not found", self.0)
    }
}

#[derive(Debug, Clone)]
struct InvalidTagError(&'static str);

impl std::error::Error for TagNotFoundError {}
impl std::error::Error for InvalidTagError {}

impl fmt::Display for InvalidTagError {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "invalid value in tag <{}>", self.0)
    }
}

#[derive(Debug)]
pub struct FeedDocument {
    root_node: Element,

    limit: usize,
}

impl FeedDocument {
    pub fn parse(data: &[u8]) -> Result<Self> {
        let root_node = Element::parse(data)?;
        if root_node.name != "rss" {
            return Err(TagNotFoundError("rss").into());
        }
        Ok(Self {
            root_node,
            limit: usize::MAX,
        })
    }

    pub fn with_limit(mut self, limit: usize) -> Self {
        self.limit = limit;
        self
    }

    pub fn read_info(&self) -> Result<FeedInfo> {
        let node_channel = self
            .root_node
            .get_child("channel")
            .ok_or_else(|| TagNotFoundError("channel"))?;

        let meta = Self::read_meta(node_channel)?;
        let items = node_channel
            .children
            .iter()
            .flat_map(|node| match node {
                XMLNode::Element(e) if e.name == "item" => Some(e),
                _ => None,
            })
            .take(self.limit)
            .map(|tag| Self::read_item(tag))
            .try_collect()?;

        Ok(FeedInfo { meta, items })
    }

    fn read_meta(node_channel: &Element) -> Result<FeedMeta> {
        let title = node_channel
            .get_child("title")
            .ok_or_else(|| TagNotFoundError("title"))?
            .get_text()
            .ok_or_else(|| InvalidTagError("title"))?
            .into_owned();
        Ok(FeedMeta { title })
    }

    fn read_item(node_item: &Element) -> Result<FeedItem> {
        let title = node_item
            .get_child("title")
            .ok_or_else(|| TagNotFoundError("title"))?
            .get_text()
            .ok_or_else(|| InvalidTagError("title"))?
            .into_owned();
        let link = node_item
            .get_child("link")
            .ok_or_else(|| TagNotFoundError("link"))?
            .get_text()
            .ok_or_else(|| InvalidTagError("link"))?
            .into_owned();
        Ok(FeedItem { title, link })
    }

    pub fn into_item_nodes(mut self) -> Result<Vec<XMLNode>> {
        let node_channel = self
            .root_node
            .take_child("channel")
            .ok_or_else(|| TagNotFoundError("channel"))?;

        let items: Vec<_> = node_channel
            .children
            .into_iter()
            .flat_map(|node| match node {
                XMLNode::Element(ref e) if e.name == "item" => Some(node),
                _ => None,
            })
            .take(self.limit)
            .collect();

        Ok(items)
    }
}

#[cfg(test)]
mod tests {
    use std::fs;
    use std::fs::File;
    use std::io::{read_to_string, BufReader, Read};

    use super::*;

    const PATH: &str = "./src/tests/data/";

    macro_rules! test_case {
        ($name:literal, $test_func:ident) => {
            #[test]
            fn $test_func() -> Result<()> {
                test_xml($name)
            }
        };
    }

    test_case!("1", test_xml_1);
    test_case!("2", test_xml_2);
    test_case!("3", test_xml_3);
    test_case!("4", test_xml_4);
    test_case!("5", test_xml_5);

    fn test_xml(name: &str) -> Result<()> {
        let result = {
            let file = File::open(format!("{PATH}/{name}.xml"))?;
            let data = read_to_string(file)?;
            let feed_info = FeedDocument::parse(data.as_bytes())?.with_limit(25).read_info()?;
            serde_json::to_string_pretty(&feed_info).unwrap()
        };

        // Uncomment following lines to generate result files
        // {
        //     use std::io::{BufWriter, Write};
        //     let file = File::create(format!("{PATH}/{name}.result.json"))?;
        //     let mut writer = BufWriter::new(file);
        //     writer.write_all(result.as_bytes())?;
        //     writer.flush()?;
        // }

        let expected = {
            let file = File::open(format!("{PATH}/{name}.result.json"))?;
            let mut reader = BufReader::new(file);
            let mut result = String::new();
            reader.read_to_string(&mut result)?;
            result
        };
        assert_eq!(expected, result);
        Ok(())
    }
}
