import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/router'
import User from '../models/User';
import { validateEmail } from '../common/validation';

interface Props {
  open: boolean;
  handleClose: () => void;
  switchToRegister: () => void;
  setUser: (user: User | null) => void;
}

export default function LoginDialog(props: Props) {
  const { open, handleClose, switchToRegister, setUser } = props;

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const router = useRouter();

  function handleLogin(): void {
    if (!validateEmail(email)) {
      enqueueSnackbar("Invalid E-mail.", {
        variant: 'error',
      });
      return;
    }

    fetch("/api/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((res: Response) => {
        if (res.status == 200) {
          res.json().then((user: User) => {
            setUser(user);
            enqueueSnackbar("Login successfully.", {
              variant: 'success',
            });
            router.push('/my');
            handleClose();
          });
        } else {
          res.text().then((message) => {
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
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Login</DialogTitle>
      <DialogContent>
        <TextField
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
        <Button onClick={switchToRegister}>Register</Button>
        <div style={{ flex: '1 0 0' }} />
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleLogin} variant="contained">Login</Button>
      </DialogActions>
    </Dialog>
  );
}
