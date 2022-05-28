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

interface Props {
  user: User | null,
  openLogin: boolean;
  setOpenLogin: (open: boolean) => void;
  openRegister: boolean;
  setOpenRegister: (open: boolean) => void;
}

export default function ButtonAppBar(props: Props) {
  const { user, openLogin, setOpenLogin, openRegister, setOpenRegister } = props;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            mior
          </Typography>
          {user
            ? <IconButton>
              <Avatar
                alt={user.nickname}
                src={gravatar.url(user.email, { d: '404' })}
                onClick={(e) => setAnchorEl(e.currentTarget)}
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
              <MenuItem>Log out</MenuItem>
            </Menu>
          }
          <LoginDialog
            open={openLogin}
            handleClose={() => setOpenLogin(false)}
            switchToRegister={() => {
              setOpenLogin(false);
              setOpenRegister(true);
            }}
          />
          <RegisterDialog
            open={openRegister}
            handleClose={() => setOpenRegister(false)}
            switchToLogin={() => {
              setOpenRegister(false); setOpenLogin(true);
            }}
          />
        </Toolbar>
      </AppBar>
    </Box>
  );
}
