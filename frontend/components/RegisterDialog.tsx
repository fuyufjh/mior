import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/router'
import User from '../models/User';
import { validateEmail, validatePassword } from '../common/validation';

interface Props {
  open: boolean;
  handleClose: () => void;
  switchToLogin: () => void;
  setUser: (user: User | null) => void;
}

export default function RegisterDialog(props: Props) {
  const { open, handleClose, switchToLogin, setUser } = props;

  const [email, setEmail] = React.useState("");
  const [nickname, setNickname] = React.useState("");
  const [password, setPassword] = React.useState("");

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const router = useRouter();

  function handleRegister(): void {
    if (!validateEmail(email)) {
      enqueueSnackbar("Invalid E-mail.", {
        variant: 'error',
      });
      return;
    }
    if (!validatePassword(password)) {
      enqueueSnackbar("Password must be at least 6 characters", {
        variant: 'error',
      });
      return;
    }

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
      .then((result: Response) => {
        if (result.status == 200) {
          result.json().then((user: User) => {
            setUser(user);
            enqueueSnackbar("Registered successfully.", {
              variant: 'success',
            });
            router.push('/my');
          });
        } else {
          result.text().then((text) => {
            enqueueSnackbar(text, {
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
    handleClose();
  }

  const invalidEmail = email.length > 0 && !validateEmail(email);
  const invalidPassword = password.length > 0 && !validatePassword(password);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs">
      <DialogTitle>Register</DialogTitle>
      <DialogContent>
        <TextField
          id="email"
          error={invalidEmail}
          helperText={invalidEmail ? "Invalid" : ""}
          label="E-mail"
          type="email"
          fullWidth
          variant="standard"
          margin="dense"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
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
          error={invalidPassword}
          helperText={invalidPassword ? "Too short" : ""}
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
