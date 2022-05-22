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

interface Props {
  open: boolean;
  handleClose: () => void;
}

const CORS_PROXY = "https://warp-co.rs/";

export default function AddFeedDialog(props: Props) {
  const { open, handleClose } = props;

  const [url, setUrl] = React.useState("");
  const [name, setName] = React.useState("");

  const [showFetchOK, setShowFetchOK] = React.useState(false);
  const [showFetchErr, setShowFetchErr] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState("");

  React.useEffect(() => {
    if (url) {
      fetch(CORS_PROXY + url)
        .then(res => res.text())
        .then(text => new XMLParser().parse(text))
        .then((result: any) => {
          try {
            const title = result.rss.channel.title as string;
            setName(title);
          } catch (err) {
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
    }
  }, [url])

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add RSS Feed</DialogTitle>
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
          <TextField
            margin="dense"
            id="keywords"
            label="Keywords (optional)"
            type="text"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant='contained' onClick={handleClose}>Subscribe</Button>
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
