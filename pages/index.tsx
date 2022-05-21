import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '../src/Link';
import ProTip from '../src/ProTip';
import Copyright from '../src/Copyright';
import FeedList from '../components/FeedList'
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add'

const Home: NextPage = () => {
  return (
    <Box>
      <Container maxWidth="lg">
        <Box sx={{
          my: 4,
        }}>
          <FeedList />
        </Box>
        <Box sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
        }}>
          <Fab color="primary" aria-label="add">
            <AddIcon />
          </Fab>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
