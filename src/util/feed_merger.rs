use std::io::{BufRead, Write};

use anyhow::{anyhow, Result};
use quick_xml::events::Event;
use quick_xml::{Reader, Writer};

pub struct FeedSource<'a, B: BufRead, W: Write>
where
    &'a mut W: std::io::Write,
{
    reader: Reader<B>,

    writer: Writer<&'a mut W>,
}

impl<'a, B, W> FeedSource<'a, B, W>
where
    B: BufRead,
    W: Write,
    &'a mut W: Write,
{
    pub fn new(text: B, out: &'a mut W) -> Self {
        let mut reader = Reader::from_reader(text);
        reader.trim_text(true);
        let writer = Writer::new(out);
        Self { reader, writer }
    }

    pub fn read_one_item(&mut self) -> Result<bool> {
        // Levels of `<item>` tags.
        // - zero means outside of any `<item>` tag,
        // - positive number means inside of one or more `<item>` tags
        let mut level = 0usize;

        let mut buf = Vec::new();
        loop {
            match self.reader.read_event(&mut buf) {
                Ok(Event::Start(e)) if e.name() == b"item" => {
                    level += 1;
                    self.writer.write_event(Event::Start(e))?;
                }
                Ok(Event::End(e)) if e.name() == b"item" => {
                    level -= 1;
                    self.writer.write_event(Event::End(e))?;
                    if level == 0 {
                        return Ok(true);
                    }
                }
                Ok(Event::Eof) => return Ok(false),
                Ok(e) => {
                    if level > 0 {
                        self.writer.write_event(e)?;
                    }
                }
                Err(e) => {
                    return Err(anyhow!(
                        "Error at position {}: {:?}",
                        self.reader.buffer_position(),
                        e
                    ))
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {

    use std::fs::File;
    use std::io::{BufReader, Cursor, Read};

    use rocket::form::validate::range;

    use super::*;

    const PATH: &str = "./src/tests/data/";

    #[test]
    fn test_merge_feeds() -> Result<()> {
        let mut out = Cursor::new(Vec::new());
        // TODO: support XML namespaces (`xmlns`)
        out.write_all(r#"<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:nyaa="https://nyaa.si/xmlns/nyaa" version="2.0"><channel>"#.as_bytes())?;
        for name in ["1", "2", "3", "4", "5"] {
            let file = File::open(format!("{PATH}/{name}.xml"))?;
            let reader = BufReader::new(file);
            let mut source = FeedSource::new(reader, &mut out);
            for _ in 0..20 {
                if !source.read_one_item()? {
                    break;
                }
            }
        }
        out.write_all("</channel></rss>".as_bytes())?;

        let result = out.into_inner();
        {
            use std::io::{BufWriter, Write};
            let file = File::create(format!("{PATH}/merged.xml"))?;
            let mut writer = BufWriter::new(file);
            writer.write_all(result.as_slice())?;
            writer.flush()?;
        }

        Ok(())
    }
}
