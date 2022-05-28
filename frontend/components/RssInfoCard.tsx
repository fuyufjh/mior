import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  token: string;
}

export default function RssInfoCard(props: Props) {
  const { token } = props;

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const [url, setUrl] = React.useState("");
  React.useEffect(() => {
    // The `window` object here must be used inside of `useEffect`
    setUrl(window.location.origin + `/rss?token=${token}`);
  }, [])

  const onClickCopy = () => {
    navigator.clipboard.writeText(url);
    setSnackbarOpen(true);
  }

  return (
    <>
      <Card>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Merged RSS Feed
          </Typography>
          <Box>
            <TextField
              hiddenLabel
              fullWidth
              disabled
              id="rss-url"
              value={url}
              size="small"
              InputProps={{
                endAdornment: <IconButton onClick={onClickCopy} edge='end'>
                  <ContentCopyIcon />
                </IconButton>
              }}
            />
          </Box>
        </CardContent>
      </Card >
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="URL Copied"
        action={
          <React.Fragment>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => setSnackbarOpen(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </>
  );
}
