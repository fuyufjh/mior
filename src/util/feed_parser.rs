use std::io::BufRead;

use anyhow::{anyhow, Result};
use quick_xml::events::Event;
use quick_xml::Reader;

use crate::model::{FeedInfo, FeedItem, FeedMeta};

pub struct FeedParser<T: BufRead> {
    reader: Reader<T>,

    /// Max number of items to parse
    limit: usize,
}

impl<T> FeedParser<T>
where
    T: BufRead,
{
    pub fn new(text: T, limit: usize) -> Self {
        let mut reader = Reader::from_reader(text);
        reader.trim_text(true);
        Self { reader, limit }
    }

    pub fn parse(&mut self) -> Result<FeedInfo> {
        let mut buf = Vec::new();
        loop {
            match self.reader.read_event(&mut buf) {
                Ok(Event::Start(ref e)) if e.name() == b"channel" => {
                    break self.parse_channel();
                }
                Ok(Event::Eof) => break Err(anyhow!("Tag <channel> not found")),
                Err(e) => break Err(anyhow!("Error at position {}: {:?}", self.reader.buffer_position(), e)),
                _ => (),
            }
        }
    }

    fn parse_channel(&mut self) -> Result<FeedInfo> {
        let mut meta = FeedMeta::default();
        let mut items = Vec::new();
        let mut buf = Vec::new();
        loop {
            match self.reader.read_event(&mut buf) {
                Ok(Event::Start(ref e)) => match e.name() {
                    b"title" => {
                        meta.title = self.parse_text(e.name())?;
                    }
                    b"item" => {
                        items.push(self.parse_item()?);
                        if items.len() >= self.limit {
                            break;
                        }
                    }
                    _ => (),
                },
                Ok(Event::End(ref e)) if e.name() == b"channel" => {
                    break;
                }
                Ok(Event::Eof) => return Err(anyhow!("Tag <channel> not closed")),
                Err(e) => return Err(anyhow!("Error at position {}: {:?}", self.reader.buffer_position(), e)),
                _ => (),
            }
        }
        Ok(FeedInfo { meta, items })
    }

    fn parse_item(&mut self) -> Result<FeedItem> {
        let mut buf = Vec::new();
        let mut feed_item = FeedItem::default();
        loop {
            match self.reader.read_event(&mut buf) {
                Ok(Event::Start(ref e)) => match e.name() {
                    b"title" => {
                        feed_item.title = self.parse_text(e.name())?;
                    }
                    b"link" => {
                        feed_item.link = self.parse_text(e.name())?;
                    }
                    _ => (),
                },
                Ok(Event::End(ref e)) if e.name() == b"item" => break Ok(feed_item),
                Ok(Event::Eof) => break Err(anyhow!("Tag <item> not closed")),
                Err(e) => break Err(anyhow!("Error at position {}: {:?}", self.reader.buffer_position(), e)),
                _ => (),
            }
        }
    }

    fn parse_text(&mut self, tag: &[u8]) -> Result<String> {
        let mut buf = Vec::new();
        let s = match self.reader.read_event(&mut buf) {
            Ok(Event::Text(e)) => e.unescape_and_decode(&self.reader)?,
            Ok(Event::CData(e)) => String::from_utf8(e.to_vec())?,
            Ok(Event::End(ref e)) if e.name() == tag => return Ok("".to_string()),
            Err(e) => return Err(anyhow!("Error at position {}: {:?}", self.reader.buffer_position(), e)),
            Ok(Event::Eof) => return Err(anyhow!("Tag <{}> not closed", String::from_utf8_lossy(tag))),
            _ => return Err(anyhow!("Text not found")),
        };
        self.reader.read_to_end(tag, &mut buf)?;
        Ok(s)
    }
}

#[cfg(test)]
mod tests {
    use std::fs::File;
    use std::io::{BufReader, Read};

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
            let reader = BufReader::new(file);
            let parsed = FeedParser::new(reader, 25).parse()?;
            serde_json::to_string_pretty(&parsed).unwrap()
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
