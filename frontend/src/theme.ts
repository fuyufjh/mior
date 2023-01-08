import { createTheme } from '@mui/material/styles';

// Create a theme instance.
export default function(darkMode: boolean) {
  return createTheme({
    palette: {
      mode: darkMode ? 'dark' : "light",
    },
  })
};
