import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add'
import FeedInfo from '../models/FeedInfo';
import { Feed } from '@mui/icons-material';

export interface Props {
  feed: FeedInfo;
  open: boolean;
  setOpen: React.Dispatch<boolean>;
}

export default function EditFeedDialog(props: Props) {
  const {
    feed, open, setOpen
  } = props;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit RSS Feed</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here. We
            will send updates occasionally.
          </DialogContentText>
          <TextField
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            value={feed.name}
          />
          <TextField
            autoFocus
            margin="dense"
            id="url"
            label="URL"
            type="url"
            fullWidth
            variant="standard"
            value={feed.url}
          />
          <TextField
            margin="dense"
            id="keywords"
            label="Keywords (optional)"
            type="text"
            fullWidth
            variant="standard"
            value={feed.keywords}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant='contained' onClick={handleClose}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
