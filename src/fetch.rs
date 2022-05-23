use std::io::BufRead;
use std::sync::mpsc::channel;
use crate::model::{FeedMeta, FeedItem, FeedInfo};
use anyhow::{anyhow, Result};
use quick_xml::Writer;
use quick_xml::Reader;
use quick_xml::events::{Event, BytesEnd, BytesStart};
use rocket::http::hyper::body::Buf;

pub async fn fetch_rss_info(url: &str) -> Result<FeedInfo> {
    let resp = reqwest::get(url).await?;
    let text = resp.bytes().await?;
    parse_xml(text.reader())
}

fn parse_xml(text: impl BufRead) -> Result<FeedInfo> {
    let mut reader = Reader::from_reader(text);
    reader.trim_text(true);

    let mut buf = Vec::new();
    loop {
        match reader.read_event(&mut buf) {
            Ok(Event::Start(ref e)) => {
                match e.name() {
                    b"channel" => break parse_channel(&mut reader),
                    _ => (),
                }
            }
            Ok(Event::Eof) => break Err(anyhow!("Tag <channel> not found")),
            Err(e) => break Err(anyhow!("Error at position {}: {:?}", reader.buffer_position(), e)),
            _ => (),
        }
    }
}

fn parse_channel(reader: &mut Reader<impl BufRead>) -> Result<FeedInfo> {
    let mut meta = FeedMeta::default();
    let mut items = Vec::new();
    let mut buf = Vec::new();
    loop {
        match reader.read_event(&mut buf) {
            Ok(Event::Start(ref e)) => {
                match e.name() {
                    b"title" => {
                        meta.title = parse_text(reader, e.name())?;
                    }
                    b"item" => {
                        items.push(parse_item(reader)?);
                    }
                    _ => (),
                }
            }
            Ok(Event::End(ref e)) if e.name() == b"channel" => break Ok(FeedInfo { meta, items }),
            Ok(Event::Eof) => break Err(anyhow!("Tag <channel> not closed")),
            Err(e) => break Err(anyhow!("Error at position {}: {:?}", reader.buffer_position(), e)),
            _ => (),
        }
    }
}

fn parse_item(reader: &mut Reader<impl BufRead>) -> Result<FeedItem> {
    let mut buf = Vec::new();
    let mut feed_item = FeedItem::default();
    loop {
        match reader.read_event(&mut buf) {
            Ok(Event::Start(ref e)) => {
                match e.name() {
                    b"title" => {
                        feed_item.title = parse_text(reader, e.name())?;
                    }
                    b"link" => {
                        feed_item.link = parse_text(reader, e.name())?;
                    }
                    _ => (),
                }
            }
            Ok(Event::End(ref e)) if e.name() == b"item" => break Ok(feed_item),
            Ok(Event::Eof) => break Err(anyhow!("Tag <item> not closed")),
            Err(e) => break Err(anyhow!("Error at position {}: {:?}", reader.buffer_position(), e)),
            _ => (),
        }
    }
}

fn parse_text(reader: &mut Reader<impl BufRead>, tag: &[u8]) -> Result<String> {
    let mut buf = Vec::new();
    let s = match reader.read_event(&mut buf) {
        Ok(Event::Text(e)) => e.unescape_and_decode(reader)?,
        Ok(Event::CData(e)) => String::from_utf8(e.to_vec())?,
        Ok(Event::End(ref e)) if e.name() == tag => return Ok("".to_string()),
        Err(e) => return Err(anyhow!("Error at position {}: {:?}", reader.buffer_position(), e)),
        Ok(Event::Eof) => return Err(anyhow!("Tag <{}> not closed", String::from_utf8_lossy(tag))),
        _ => return Err(anyhow!("Text not found")),
    };
    reader.read_to_end(tag, &mut buf)?;
    Ok(s)
}

#[cfg(test)]
mod tests {
    use super::*;

    use std::fs::File;
    use std::io::{BufReader, BufWriter, Read, Write};

    const PATH: &str = "./src/tests/data/";

    macro_rules! test_case {
        ($name:literal, $test_func:ident) => {
            #[test]
            fn $test_func() -> Result<()> {
                test_xml($name)
            }
        }
    }

    test_case!("1", test_xml_1);
    test_case!("2", test_xml_2);
    test_case!("3", test_xml_3);

    fn test_xml(name: &str) -> Result<()> {
        info!("running test {name}.xml...");
        let result = {
            let file = File::open(format!("{PATH}/{name}.xml"))?;
            let reader = BufReader::new(file);
            let parsed = parse_xml(reader)?;
            serde_json::to_string_pretty(&parsed).unwrap()
        };

        // Uncomment following code to generate result files
        {
            let file = File::create(format!("{PATH}/{name}.result.json"))?;
            let mut writer = BufWriter::new(file);
            writer.write_all(result.as_bytes())?;
            writer.flush()?;
        }

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