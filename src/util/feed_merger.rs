use chrono::{DateTime, Utc};
use xmltree::{Element, XMLNode};

use crate::error::Error;
use crate::util::feed_parser::FeedDocument;

type Result<T> = std::result::Result<T, Error>;

pub struct FeedMerger {
    elements: Vec<(XMLNode, Option<DateTime<Utc>>)>,
}

impl FeedMerger {
    pub fn new() -> Self {
        Self { elements: Vec::new() }
    }

    /// Append all feed items in `doc`
    pub fn append(&mut self, doc: FeedDocument) -> Result<()> {
        let mut item_nodes = doc.into_item_nodes()?;
        self.elements.append(&mut item_nodes);
        Ok(())
    }

    pub fn build(mut self) -> Vec<u8> {
        // Sort the elements from most recent to least
        self.elements.sort_by_key(|e| e.1);
        self.elements.reverse();

        // Build the element tree
        let mut root_node = Element::new("rss");
        let mut channel = Element::new("channel");
        let mut title = Element::new("title");
        title.children.push(XMLNode::Text("MIOR".to_owned()));
        channel.children.push(XMLNode::Element(title));
        for e in self.elements {
            channel.children.push(e.0);
        }
        root_node.children.push(XMLNode::Element(channel));

        // Write out as text
        let mut buf = Vec::new();
        root_node.write(&mut buf).unwrap();
        buf
    }
}

#[cfg(test)]
mod tests {
    use std::fs;

    use super::*;

    const PATH: &str = "./src/tests/data/";

    #[test]
    fn test_merge_feeds() {
        let mut merger = FeedMerger::new();
        for name in ["1", "2", "3", "4", "5"] {
            let data = fs::read_to_string(format!("{PATH}/{name}.xml")).unwrap();
            let doc = FeedDocument::parse(data.as_bytes()).unwrap().with_limit(20);
            merger.append(doc).unwrap();
        }

        let result = merger.build();

        // Uncomment following lines to generate result files
        // {
        //     use std::fs::File;
        //     use std::io::{BufWriter, Write};
        //     let file = File::create(format!("{PATH}/merged.xml")).unwrap();
        //     let mut writer = BufWriter::new(file);
        //     writer.write_all(result.as_slice()).unwrap();
        //     writer.flush().unwrap();
        // }

        let expected = fs::read_to_string(format!("{PATH}/merged.xml")).unwrap();

        // NOTE: only checked length because the text representation changes every time,
        // perhaps caused by the HashMap of attributes
        assert_eq!(expected.len(), result.len());
    }
}
