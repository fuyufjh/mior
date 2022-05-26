import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import FeedPreviewTable from './FeedPreviewTable';
import FeedItem from '../models/FeedItem';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import FeedInfo from '../models/FeedInfo';

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
  setFeed: React.Dispatch<React.SetStateAction<FeedInfo>>;
  refreshFeedList: () => void;
}

export default function EditFeedDialog(props: Props) {
  const { open, handleClose, feed, setFeed, refreshFeedList } = props;
  const isNew = feed.id === -1;

  const setUrl = (url: string) => setFeed(prev => ({ ...prev, url }));
  const setName = (name: string) => setFeed(prev => ({ ...prev, name }));
  const setKeywords = (keywords: string) => setFeed(prev => ({ ...prev, keywords }));

  // Control the snackbar of sucess or failure
  const [showFetchOk, setShowFetchOk] = React.useState(false);
  const [showFetchErr, setShowFetchErr] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState("");

  // Control the Preview dialog
  const [showPreview, setShowPreview] = React.useState(false);

  // State of fetched items
  const [fetchedItems, setFetchedItems] = React.useState([] as FeedItem[]);

  React.useEffect(() => {
    if (feed.url) {
      fetch(`/api/fetch?url=${encodeURIComponent(feed.url)}`)
        .then(res => res.json())
        .then((result: any) => {
          if (feed.name === "") {
            setName(result.meta.title);
          }
          const items = (result.items as any[]).map((item: any, index: number) => ({
            index: index,
            title: item.title,
            link: item.link,
          }));
          setFetchedItems(items);
          setShowFetchOk(true);
        })
        .catch((error: any) => {
          setErrMsg(String(error));
          setShowFetchErr(true);
          setFetchedItems([]);
          console.error(error);
        })
    } else {
      setFetchedItems([]);
    }
  }, [feed.url])

  // Filter fetched items by user-specified keywords
  const previewItems = filterItems(fetchedItems, feed.keywords);

  let onCloseFetchOkSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowFetchOk(false);
  };
  let onCloseFetchErrSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowFetchErr(false);
  };

  const handleSubmit = () => {
    let endpoint: string;
    if (feed.id === -1) {
      endpoint = "/api/feeds"; // create
    } else {
      endpoint = `/api/feeds/${feed.id}`; // update
    }

    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(feed),
    })
      .then((result: any) => {
        console.log(result);
      })
      .catch((error: any) => {
        console.error(error);
      });
    handleClose();
    refreshFeedList();
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isNew ? "Add" : "Edit"} RSS Feed</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to an RSS feed, please enter the URL here. You may optinally filter the results
            with keywords, which must appear in the title of items.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="url"
            label="URL"
            type="url"
            fullWidth
            variant="standard"
            value={feed.url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <TextField
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            value={feed.name}
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
              value={feed.keywords}
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
          <Button variant='contained' onClick={handleSubmit}>Submit</Button>
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
        open={showFetchOk}
        autoHideDuration={3000}
        onClose={onCloseFetchOkSnackbar}
      >
        <Alert severity="success">Fetched RSS feed successfully.</Alert>
      </Snackbar>

      <Snackbar
        open={showFetchErr}
        autoHideDuration={3000}
        onClose={onCloseFetchErrSnackbar}
      >
        <Alert severity="error">{errMsg}</Alert>
      </Snackbar>
    </>
  );
}
