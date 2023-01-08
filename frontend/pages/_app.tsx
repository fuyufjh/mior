import * as React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createTheme from '../src/theme';
import createEmotionCache from '../src/createEmotionCache';
import NavBar from '../components/NavBar';
import '../styles/global.css';
import { SnackbarProvider } from 'notistack';
import User from '../models/User';
import useMediaQuery from '@mui/material/useMediaQuery';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const [openLogin, setOpenLogin] = React.useState(false);
  const [openRegister, setOpenRegister] = React.useState(false);

  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    fetch("/api/user")
      .then(res => {
        if (res.status == 200) {
          res.json().then((user: User) => {
            setUser(user);
          })
        } else {
          res.text().then((message) => {
            console.error(message);
          })
        }
      })
      .catch((error: any) => {
        console.error(error);
      })
  }, []);

  const darkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(() => createTheme(darkMode), [darkMode]);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>mior</title>
        <meta name="theme-color" content={theme.palette.primary.main} />
        <meta name="viewport" content="initial-scale=1, width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <NavBar
            openLogin={openLogin}
            setOpenLogin={setOpenLogin}
            openRegister={openRegister}
            setOpenRegister={setOpenRegister}
            user={user}
            setUser={setUser}
          />
          <Component
            user={user}
            setOpenRegister={setOpenRegister}
            {...pageProps}
          />
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
