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

const Home: NextPage = () => {
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
        <AddFeedDialog />
      </Container>
    </Box>
  );
};

export default Home;
