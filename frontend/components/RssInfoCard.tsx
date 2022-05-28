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
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';

interface Props {
  token: string;
}

export default function RssInfoCard(props: Props) {
  const { token } = props;

  const [url, setUrl] = React.useState("");
  React.useEffect(() => {
    // The `window` object here must be used inside of `useEffect`
    setUrl(window.location.origin + `/rss?token=${token}`);
  }, [token])

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const onClickCopy = () => {
    navigator.clipboard.writeText(url);
    enqueueSnackbar("URL copied to clipboard.", {
      variant: 'success',
    });
  }

  return (
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
  );
}
