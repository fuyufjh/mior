import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Button } from '@mui/material';
import User from '../models/User';
import Link from 'next/link';
import { useMediaQuery, useTheme, alpha } from '@mui/material';

interface Props {
  user: User,
  setOpenRegister: (open: boolean) => void;
}

// Reference: https://github.com/mui/material-ui/issues/10739
function useAppBarHeight(): number {
  const {
    mixins: { toolbar },
    breakpoints,
  } = useTheme();
  const toolbarDesktopQuery = breakpoints.up('sm');
  const toolbarLandscapeQuery = `${breakpoints.up('xs')} and (orientation: landscape)`;
  const isDesktop = useMediaQuery(toolbarDesktopQuery);
  const isLandscape = useMediaQuery(toolbarLandscapeQuery);
  let currentToolbarMinHeight;
  if (isDesktop) {
    currentToolbarMinHeight = toolbar[toolbarDesktopQuery];
  } else if (isLandscape) {
    currentToolbarMinHeight = toolbar[toolbarLandscapeQuery];
  } else {
    currentToolbarMinHeight = toolbar;
  }
  type MinHeight = { minHeight: number };
  return (currentToolbarMinHeight as MinHeight).minHeight;
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
        style={{ height: `calc(100vh - ${useAppBarHeight()}px)` }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: (theme) => alpha(theme.palette.background.default, 0.7),
            py: 4,
            width: 1,
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom sx={{
            fontFamily: 'Montserrat',
            fontWeight: 700,
            color: 'text.primary',
          }}>
            mior
          </Typography>
          <Typography variant="h5" component="h1" gutterBottom sx={{
            fontFamily: 'Montserrat',
            fontWeight: 600,
            color: 'text.primary',
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
