import { createTheme } from '@mui/material/styles';

const primaryGreen = '#2F855A';
const appBackground = '#D0E2D0';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primaryGreen,
      contrastText: '#FFFFFF',
    },
    background: {
      default: appBackground,
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#4A5568',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif',
    h3: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        variant: 'outlined',
      },
    },
  },
});

export default theme;
