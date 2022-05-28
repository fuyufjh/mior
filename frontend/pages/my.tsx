import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import FeedList from '../components/FeedList'
import AddFeedDialog from '../components/EditFeedDialog';
import RssInfoCard from '../components/RssInfoCard'
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import FeedInfo from '../models/FeedInfo';
import { useSnackbar } from 'notistack';

const EMPTY_FEED: FeedInfo = { id: -1, name: '', url: '', keywords: '' }

const MyFeeds: NextPage = () => {

  const [feeds, setFeeds] = React.useState([] as FeedInfo[]);

  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [editingFeed, setEditingFeed] = React.useState(EMPTY_FEED);

  // Increse the counter to triggle refreshing the feed list
  const [editCounter, setEditCounter] = React.useState(1);
  const refresh = () => setEditCounter(prev => prev + 1);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const addFeed = () => {
    setEditingFeed(EMPTY_FEED);
    setOpenEditDialog(true);
  }
  const editFeed = (feed: FeedInfo) => {
    setEditingFeed(feed);
    setOpenEditDialog(true);
  }

  React.useEffect(() => {
    fetch("/api/feeds")
      .then(res => {
        if (res.status == 200) {
          res.json().then((result: any) => {
            const feeds = result as FeedInfo[];
            setFeeds(feeds);
          })
        } else {
          res.text().then((message) => {
            enqueueSnackbar(message, {
              variant: 'error',
            });
          })
        }
      })
      .catch((error: any) => {
        console.error(error);
      })
  }, [editCounter])

  return (
    <>
      <Container>
        <Box sx={{
          my: 2,
        }}>
          <RssInfoCard />
        </Box>
      </Container>

      <Container maxWidth="lg">
        <Box sx={{
          my: 2,
        }}>
          <FeedList feeds={feeds} openEditDialog={editFeed} refreshFeedList={refresh} />
        </Box>
      </Container>

      <Box sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
      }}>
        <Fab color="primary" aria-label="add" onClick={addFeed}>
          <AddIcon />
        </Fab>
      </Box>

      <AddFeedDialog
        open={openEditDialog}
        handleClose={() => setOpenEditDialog(false)}
        feed={editingFeed}
        setFeed={setEditingFeed}
        refreshFeedList={refresh}
      />
    </>
  );
};

export default MyFeeds;
