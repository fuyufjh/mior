import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { XMLParser } from 'fast-xml-parser'
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import FeedPreviewTable from './FeedPreviewTable';
import FeedItem from '../models/FeedItem';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import FeedInfo from '../models/FeedInfo';

function readItems(item: any): FeedItem[] {
  if (item) {
    if (Array.isArray(item)) {
      // multiple items
      return (item as any[]).map((e: any, index: number) => ({
        index: index,
        title: e.title,
        link: e.link,
      }))
    } else {
      // single item
      return [{
        index: 0,
        title: item.title,
        link: item.link,
      }]
    }
  }
  return [];
}

function filterItems(items: FeedItem[], keywords: string | string[]): FeedItem[] {
  if (typeof keywords === 'string') {
    keywords = keywords.split(' ').filter(s => s.length > 0)
  }
  return items.filter(item => {
    for (var keyword of keywords) {
      if (item.title.indexOf(keyword) == -1) {
        return false;
      }
    }
    return true;
  })
}

interface Props {
  open: boolean;
  handleClose: () => void;
  feed: FeedInfo;
  setFeed: (feed: FeedInfo) => void;
}

const CORS_PROXY = "https://warp-co.rs/";

export default function AddFeedDialog(props: Props) {
  const { open, handleClose, feed, setFeed } = props;
  const { id, url, name, keywords } = feed;
  const isNew = id === -1;

  const setUrl = (url: string) => {
    setFeed({ id, url, name, keywords });
  };
  const setName = (name: string) => {
    setFeed({ id, url, name, keywords });
  };
  const setKeywords = (keywords: string) => {
    setFeed({ id, url, name, keywords });
  }

  // Control the snackbar of sucess or failure
  const [showFetchOK, setShowFetchOK] = React.useState(false);
  const [showFetchErr, setShowFetchErr] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState("");

  // Control the Preview dialog
  const [showPreview, setShowPreview] = React.useState(false);

  // State of fetched items
  const [fetchedItems, setFetchedItems] = React.useState([] as FeedItem[]);

  React.useEffect(() => {
    if (url) {
      fetch(CORS_PROXY + url)
        .then(res => res.text())
        .then(text => new XMLParser().parse(text))
        .then((result: any) => {
          try {
            const title = result.rss.channel.title as string;
            setName(title);
            const item = result.rss.channel.item;
            const fetchedItems = readItems(item);
            setFetchedItems(fetchedItems);
          } catch (err) {
            setFetchedItems([]);
            console.error(err);
            console.log(result);
            throw new Error("Bad XML format");
          }
          setShowFetchOK(true);
        })
        .catch((error: any) => {
          setErrMsg(String(error));
          setShowFetchErr(true);
          console.error(error);
        })
    } else {
      setFetchedItems([]);
    }
  }, [url])

  // Filter fetched items by user-specified keywords
  const previewItems = filterItems(fetchedItems, keywords);

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isNew ? "Add" : "Edit"} RSS Feed</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here. We
            will send updates occasionally.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="url"
            label="URL"
            type="url"
            fullWidth
            variant="standard"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <TextField
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Tooltip TransitionComponent={Zoom} title="Seperated by spaces" arrow>
            <TextField
              margin="dense"
              id="keywords"
              label="Filter Keywords (Optional)"
              type="text"
              fullWidth
              variant="standard"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </Tooltip>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(true)} disabled={previewItems.length === 0}>
            Preview ({previewItems.length})
          </Button>
          <div style={{ flex: '1 0 0' }} />
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant='contained' onClick={handleClose}>Subscribe</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="xl">
        <DialogTitle>Preview</DialogTitle>
        <DialogContent sx={{ "padding-bottom": 0 }}>
          <FeedPreviewTable rows={previewItems} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Dismiss</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showFetchOK}
        autoHideDuration={3000}
        onClose={() => setShowFetchOK(false)}
      >
        <Alert severity="success">Fetched metadata successfully.</Alert>
      </Snackbar>

      <Snackbar
        open={showFetchErr}
        autoHideDuration={3000}
        onClose={() => setShowFetchErr(false)}
      >
        <Alert severity="error">{errMsg}</Alert>
      </Snackbar>
    </>
  );
}
