import * as React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import theme from '../src/theme';
import createEmotionCache from '../src/createEmotionCache';
import NavBar from '../components/NavBar';
import '../styles/global.css';
import { SnackbarProvider } from 'notistack';
import User from '../models/User';

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

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
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
            setOpenRegister={setOpenRegister}
            {...pageProps}
          />
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
