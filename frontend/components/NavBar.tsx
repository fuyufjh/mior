import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LoginDialog from './LoginDialog';
import RegisterDialog from './RegisterDialog';
import User from '../models/User';
import Avatar from '@mui/material/Avatar';
import gravatar from 'gravatar'
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/router'
import Link from 'next/link';

interface Props {
  user: User | null,
  setUser: (user: User | null) => void;
  openLogin: boolean;
  setOpenLogin: (open: boolean) => void;
  openRegister: boolean;
  setOpenRegister: (open: boolean) => void;
}

export default function MyAppBar(props: Props) {
  const { user, setUser, openLogin, setOpenLogin, openRegister, setOpenRegister } = props;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const router = useRouter();

  const handleLogOut = () => {
    fetch("/api/logout", {
      method: 'POST',
    })
      .then((result: Response) => {
        if (result.status == 200) {
          setUser(null);
          enqueueSnackbar("Logged out successfully.", {
            variant: 'success',
          });
          router.push('/');
        } else {
          result.text().then((message) => {
            enqueueSnackbar(message, {
              variant: 'error',
            });
          });
        }
      })
      .catch((error: any) => {
        enqueueSnackbar(error.toString(), {
          variant: 'error',
        });
      });
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Link href={'/'}>
            <Typography variant="h5" component="div" sx={{
              fontWeight: 500,
              cursor: 'pointer',
              paddingRight: 2,
            }}>
              mior
            </Typography>
          </Link>
          {user &&
            <Box>
              <Link href={'/my'}>
                <Button sx={{ color: 'white', display: 'block' }}>
                  My Feeds
                </Button>
              </Link>
            </Box>
          }
          <Box sx={{ flexGrow: 1 }}></Box>
          {user
            ? <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
              <Avatar
                alt={user.nickname}
                src={gravatar.url(user.email, { d: '404' })}
              />
            </IconButton>
            : <Button
              color="inherit"
              onClick={() => setOpenLogin(true)}
            >
              Login
            </Button>
          }
          {user &&
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem disabled={true}>Email: {user.email}</MenuItem>
              <MenuItem onClick={handleLogOut}>Log out</MenuItem>
            </Menu>
          }
          <LoginDialog
            open={openLogin}
            handleClose={() => setOpenLogin(false)}
            switchToRegister={() => {
              setOpenLogin(false);
              setOpenRegister(true);
            }}
            setUser={setUser}
          />
          <RegisterDialog
            open={openRegister}
            handleClose={() => setOpenRegister(false)}
            switchToLogin={() => {
              setOpenRegister(false); setOpenLogin(true);
            }}
            setUser={setUser}
          />
        </Toolbar>
      </AppBar>
    </Box>
  );
}
