import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import FeedInfo from '../models/FeedInfo';
import EditFeedDialog from './EditFeedDialog';

const subscribedFeeds: FeedInfo[] = [
  { id: 1, name: "夏日重现", url: "https://mikanani.me/RSS/Bangumi?bangumiId=2711&subgroupid=382", keywords: "1080p 简日" },
  { id: 2, name: "辉夜大小姐想让我告白-Ultra Romantic-", url: "https://mikanani.me/RSS/Bangumi?bangumiId=2699&subgroupid=552", keywords: "CHT" },
  { id: 3, name: "间谍过家家", url: "https://mikanani.me/RSS/Bangumi?bangumiId=2709&subgroupid=562", keywords: "" },
];

interface Props {
  openEditDialog: (feed: FeedInfo) => void;
}

export default function FeedList(props: Props) {
  const { openEditDialog } = props;

  return (
    <List>
      {subscribedFeeds.map((feed: FeedInfo) => (
        <ListItem
          key={feed.id}
          secondaryAction={
            <>
              <IconButton aria-label="edit" onClick={() => openEditDialog(feed)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete">
                <DeleteIcon />
              </IconButton>
            </>
          }
        >
          <ListItemAvatar>
            <Avatar>
              <RssFeedIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={feed.name}
            secondary={feed.url}
          />
        </ListItem>
      ))}
    </List >
  );
}
