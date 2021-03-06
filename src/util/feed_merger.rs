use xmltree::{Element, XMLNode};

use crate::error::Error;
use crate::util::feed_parser::FeedDocument;

type Result<T> = std::result::Result<T, Error>;

pub struct FeedMerger {
    root_node: Element,
}

impl FeedMerger {
    pub fn new() -> Self {
        let mut root_node = Element::new("rss");
        let mut channel = Element::new("channel");
        let mut title = Element::new("title");
        title.children.push(XMLNode::Text("MIOR".to_owned()));
        channel.children.push(XMLNode::Element(title));
        root_node.children.push(XMLNode::Element(channel));

        Self { root_node }
    }

    /// Append all feed items in `doc`
    pub fn append(&mut self, doc: FeedDocument) -> Result<()> {
        let mut item_nodes = doc.into_item_nodes()?;
        let node_channel = self.root_node.get_mut_child("channel").unwrap();
        node_channel.children.append(&mut item_nodes);
        Ok(())
    }

    pub fn build(&self) -> Vec<u8> {
        let mut buf = Vec::new();
        self.root_node.write(&mut buf).unwrap();
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
        //     let file = File::create(format!("{PATH}/merged.xml"))?;
        //     let mut writer = BufWriter::new(file);
        //     writer.write_all(result.as_slice())?;
        //     writer.flush()?;
        // }

        let expected = fs::read_to_string(format!("{PATH}/merged.xml")).unwrap();

        // NOTE: only checked length because the text representation changes every time,
        // perhaps caused by the HashMap of attributed
        assert_eq!(expected.len(), result.len());
    }
}
