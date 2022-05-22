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

const Home: NextPage = () => {
  const [openAddDialog, setOpenAddDialog] = React.useState(false);

  const onClickAddFeed = () => {
    setOpenAddDialog(true);
  }
  const handleClose = () => {
    setOpenAddDialog(false);
  }

  return (
    <Box>
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
          <FeedList />
        </Box>
        <AddFeedDialog open={openAddDialog} handleClose={handleClose} />
      </Container>
      <Box sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
      }}>
        <Fab color="primary" aria-label="add" onClick={onClickAddFeed}>
          <AddIcon />
        </Fab>
      </Box>
    </Box>
  );
};

export default Home;
