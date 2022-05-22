import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '../src/Link';
import ProTip from '../src/ProTip';
import Copyright from '../src/Copyright';
import FeedList from '../components/FeedList'
import AddFeedDialog from '../components/EditFeedDialog';
import RssInfoCard from '../components/RssInfoCard'
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import FeedInfo from '../models/FeedInfo';

const EMPTY_FEED: FeedInfo = { id: -1, name: '', url: '', keywords: '' }

const Home: NextPage = () => {

  const [feeds, setFeeds] = React.useState([] as FeedInfo[]);

  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [editingFeed, setEditingFeed] = React.useState(EMPTY_FEED);

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
      .then(res => res.json())
      .then((result: any) => {
        console.log(result);
        const feeds = result as FeedInfo[];
        setFeeds(feeds);
      })
      .catch((error: any) => {
        console.error(error);
      })
  }, [])

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
          <FeedList feeds={feeds} openEditDialog={editFeed} />
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
      />
    </>
  );
};

export default Home;
