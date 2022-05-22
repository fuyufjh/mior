import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '../src/Link';
import ProTip from '../src/ProTip';
import Copyright from '../src/Copyright';
import FeedList from '../components/FeedList'
import AddFeedDialog from '../components/AddFeedDialog';
import RssInfoCard from '../components/RssInfoCard'
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import FeedInfo from '../models/FeedInfo';

const EMPTY_FEED: FeedInfo = { id: -1, name: '', url: '', keywords: '' }

const Home: NextPage = () => {
  const [openAddDialog, setOpenAddDialog] = React.useState(false);
  const [feedInfo, setFeedInfo] = React.useState(EMPTY_FEED)

  const addFeed = () => {
    setFeedInfo(EMPTY_FEED);
    setOpenAddDialog(true);
  }
  const editFeed = (feed: FeedInfo) => {
    setFeedInfo(feed);
    setOpenAddDialog(true);
  }

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
          <FeedList openEditDialog={editFeed} />
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
        open={openAddDialog}
        handleClose={() => setOpenAddDialog(false)}
        feed={feedInfo}
        setFeed={setFeedInfo}
      />
    </>
  );
};

export default Home;
