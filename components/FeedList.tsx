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

function createData(
  name: string,
  calories: number,
  fat: number,
  carbs: number,
  protein: number,
) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

export default function FeedList() {
  return (
    <List>
      <ListItem
        secondaryAction={
          <>
            <IconButton aria-label="edit">
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
          primary="Summer Time Rendering"
          secondary="https://mikanani.me/RSS/Classic"
        />
      </ListItem>
      <ListItem
        secondaryAction={
          <>
            <IconButton aria-label="edit">
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
          primary="Summer Time Rendering"
          secondary="https://mikanani.me/RSS/Classic"
        />
      </ListItem>
    </List >
  );
}
