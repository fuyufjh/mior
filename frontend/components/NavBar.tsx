import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LoginDialog from './LoginDialog';
import RegisterDialog from './RegisterDialog';

export default function ButtonAppBar() {
  const [openLogin, setOpenLogin] = React.useState(false);
  const [openRegister, setOpenRegister] = React.useState(false);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            mior
          </Typography>
          <Button color="inherit" onClick={() => setOpenLogin(true)}>Login</Button>
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
