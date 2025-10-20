import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#14213dff', // Oxford Blue
      light: '#1a2a4d',
      dark: '#0f1a2e',
      contrastText: '#ffffffff', // White
    },
    secondary: {
      main: '#fca311ff', // Orange Web
      light: '#fdb542',
      dark: '#e59400',
      contrastText: '#000000ff', // Black
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#ffffffff',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
      contrastText: '#ffffffff',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
      contrastText: '#ffffffff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffffff',
    },
    background: {
      default: '#ffffffff', // White
      paper: '#ffffffff', // White
    },
    text: {
      primary: '#000000ff', // Black
      secondary: '#14213dff', // Oxford Blue
      disabled: '#e5e5e5ff', // Platinum
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e5e5e5ff', // Platinum
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#000000ff', // Black
    },
    divider: '#e5e5e5ff', // Platinum
    action: {
      active: '#14213dff', // Oxford Blue
      hover: 'rgba(20, 33, 61, 0.08)',
      selected: 'rgba(20, 33, 61, 0.16)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#000000ff', // Black
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      color: '#000000ff', // Black
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#000000ff', // Black
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#000000ff', // Black
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#000000ff', // Black
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      color: '#000000ff', // Black
    },
    subtitle1: {
      fontSize: '1rem',
      color: '#14213dff', // Oxford Blue
    },
    subtitle2: {
      fontSize: '0.875rem',
      color: '#14213dff', // Oxford Blue
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#000000ff', // Black
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#000000ff', // Black
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      color: '#14213dff', // Oxford Blue
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: 'none',
          padding: '8px 24px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #14213dff, #1a2a4d)',
          '&:hover': {
            background: 'linear-gradient(45deg, #0f1a2e, #14213dff)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #fca311ff, #fdb542)',
          color: '#000000ff',
          '&:hover': {
            background: 'linear-gradient(45deg, #e59400, #fca311ff)',
          },
        },
        outlinedPrimary: {
          borderColor: '#14213dff',
          color: '#14213dff',
          '&:hover': {
            backgroundColor: 'rgba(20, 33, 61, 0.04)',
            borderColor: '#0f1a2e',
          },
        },
        outlinedSecondary: {
          borderColor: '#fca311ff',
          color: '#fca311ff',
          '&:hover': {
            backgroundColor: 'rgba(252, 163, 17, 0.04)',
            borderColor: '#e59400',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #14213dff, #1a2a4d)',
          boxShadow: '0 1px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
        filledPrimary: {
          backgroundColor: '#14213dff',
          color: '#ffffffff',
        },
        filledSecondary: {
          backgroundColor: '#fca311ff',
          color: '#000000ff',
        },
        outlinedPrimary: {
          borderColor: '#14213dff',
          color: '#14213dff',
        },
        outlinedSecondary: {
          borderColor: '#fca311ff',
          color: '#fca311ff',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: '#14213dff',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#14213dff',
            },
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

// Custom color variables for easy access
export const customColors = {
  black: '#000000ff',
  oxfordBlue: '#14213dff',
  orangeWeb: '#fca311ff',
  platinum: '#e5e5e5ff',
  white: '#ffffffff',
};

// Gradient presets
export const gradients = {
  primary: 'linear-gradient(135deg, #14213dff, #1a2a4d)',
  secondary: 'linear-gradient(135deg, #fca311ff, #fdb542)',
  dark: 'linear-gradient(135deg, #000000ff, #14213dff)',
  light: 'linear-gradient(135deg, #e5e5e5ff, #ffffffff)',
};

export default theme;