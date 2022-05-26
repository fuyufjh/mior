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
  switchToLogin: () => void;
}

export default function RegisterDialog(props: Props) {
  const { open, handleClose, switchToLogin } = props;

  const [email, setEmail] = React.useState("");
  const [nickname, setNickname] = React.useState("");
  const [password, setPassword] = React.useState("");

  function handleRegister(): void {
    fetch("/api/register", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        nickname: nickname,
        password: password,
      }),
    })
      .then((result: any) => {
        console.log(result);
      })
      .catch((error: any) => {
        console.error(error);
      });
    handleClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs">
      <DialogTitle>Register</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          id="email"
          label="Email"
          type="email"
          fullWidth
          variant="standard"
          margin="dense"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          autoFocus
          id="nickname"
          label="Nickname (Optional)"
          fullWidth
          variant="standard"
          margin="dense"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          fullWidth
          variant="standard"
          margin="dense"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={switchToLogin}>Login</Button>
        <div style={{ flex: '1 0 0' }} />
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleRegister} variant="contained">Register</Button>
      </DialogActions>
    </Dialog>
  );
}
