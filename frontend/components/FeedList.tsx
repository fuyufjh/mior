import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import FeedInfo from '../models/FeedInfo';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Box } from '@mui/material';

interface Props {
  feeds: FeedInfo[];
  openEditDialog: (feed: FeedInfo) => void;
  refreshFeedList: () => void;
}

export default function FeedList(props: Props) {
  const { openEditDialog, feeds, refreshFeedList } = props;

  const deleteFeed = (id: number) => {
    fetch(`/api/feeds/${id}`, {
      method: 'DELETE',
    })
      .then((result: any) => {
        console.log(result);
      })
      .catch((error: any) => {
        console.error(error);
      });
    refreshFeedList();
  };

  return (
    <List>
      {feeds.map((feed: FeedInfo) => (
        <ListItem key={feed.id} sx={{ paddingX: '8px' }}>
          <ListItemAvatar>
            <Avatar>
              <RssFeedIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={feed.name}
            secondary={feed.url}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          />
          <IconButton aria-label="edit" onClick={() => openEditDialog(feed)}>
            <EditIcon />
          </IconButton>
          <IconButton edge="end" aria-label="delete" onClick={() => deleteFeed(feed.id)}>
            <DeleteIcon />
          </IconButton>
        </ListItem>
      ))}
      <Box sx={{ height: '56px' }}></Box>
    </List >
  );
}
