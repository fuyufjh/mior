import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface Props {
  open: boolean;
  handleClose: () => void;
  switchToRegister: () => void;
}

export default function LoginDialog(props: Props) {
  const { open, handleClose, switchToRegister } = props;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Login</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          id="email"
          label="Email"
          type="email"
          fullWidth
          variant="standard"
          margin="dense"
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          fullWidth
          variant="standard"
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={switchToRegister}>Register</Button>
        <div style={{ flex: '1 0 0' }} />
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleClose} variant="contained">Login</Button>
      </DialogActions>
    </Dialog>
  );
}
