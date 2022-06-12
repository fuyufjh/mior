import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Button } from '@mui/material';
import User from '../models/User';
import Link from 'next/link';

interface Props {
  user: User,
  setOpenRegister: (open: boolean) => void;
}

const Home: NextPage<Props> = (props: Props) => {
  const { user, setOpenRegister } = props;

  return (
    <Container maxWidth="lg">
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ height: '80vh' }}
      >
        <Box
          sx={{
            my: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom sx={{
            fontFamily: 'Montserrat',
            fontWeight: 700,
            color: '#424242',
          }}>
            mior
          </Typography>
          <Typography variant="h5" component="h1" gutterBottom sx={{
            fontFamily: 'Montserrat',
            fontWeight: 600,
            color: '#424242',
          }}>
            Merge into one RSS
          </Typography>
        </Box>
        <Box sx={{
          my: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {user ?
            <Link href={'/my'}>
              <Button variant="contained">
                Go to My Feeds
              </Button>
            </Link>
            :
            <Button variant="contained" onClick={() => setOpenRegister(true)}>
              Register
            </Button>
          }
        </Box>
      </Grid>
    </Container>
  );
};

export default Home;
