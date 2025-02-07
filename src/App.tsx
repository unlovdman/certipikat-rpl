import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, alpha } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import { AuthProvider } from './contexts/AuthContext';
import { initSecurity } from './utils/securityUtils';
import './index.css';

// Obfuscated route paths
const ROUTES = {
  HOME: '/',
  AUTH: '/s2crt',  // obfuscated login route
  PORTAL: '/p0rt4l', // obfuscated dashboard route
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#7c3aed',
      light: '#a78bfa',
      dark: '#5b21b6',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    error: {
      main: '#ef4444',
      light: '#fca5a5',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fcd34d',
      dark: '#d97706',
    },
    success: {
      main: '#10b981',
      light: '#6ee7b7',
      dark: '#059669',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    body1: {
      letterSpacing: '-0.025em',
    },
    body2: {
      letterSpacing: '-0.025em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#94a3b8 transparent',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#94a3b8',
            borderRadius: '20px',
            border: '2px solid transparent',
            backgroundClip: 'content-box',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#64748b',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '12px',
          padding: '10px 24px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            transition: 'transform 0.2s ease-in-out',
            '&.Mui-focused': {
              transform: 'translateY(-2px)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '24px',
          backgroundImage: 'none',
          '&::before': {
            display: 'none',
          },
        },
        elevation1: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
        elevation2: {
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        },
        elevation3: {
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '12px 16px',
        },
        standardError: {
          backgroundColor: alpha('#ef4444', 0.1),
          color: '#ef4444',
        },
        standardWarning: {
          backgroundColor: alpha('#f59e0b', 0.1),
          color: '#f59e0b',
        },
        standardInfo: {
          backgroundColor: alpha('#3b82f6', 0.1),
          color: '#3b82f6',
        },
        standardSuccess: {
          backgroundColor: alpha('#10b981', 0.1),
          color: '#10b981',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
          transition: 'transform 0.2s ease-in-out',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
  },
});

function App() {
  useEffect(() => {
    // Initialize security measures
    if (process.env.NODE_ENV === 'production') {
      initSecurity();
    }

    // Add title and meta description
    document.title = 'Portal Sertifikat Digital';
    const metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    metaDesc.content = 'Portal Sertifikat Digital Laboratorium';
    document.head.appendChild(metaDesc);

    // Prevent going back to previous page
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function () {
      window.history.pushState(null, '', window.location.href);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div role="application" aria-label="Aplikasi Sertifikat Laboratorium">
            <Routes>
              <Route path={ROUTES.HOME} element={<Landing />} />
              <Route path={ROUTES.AUTH} element={<Login />} />
              <Route path={ROUTES.PORTAL} element={<Dashboard />} />
              <Route path="/login" element={<Navigate to={ROUTES.AUTH} replace />} />
              <Route path="/dashboard" element={<Navigate to={ROUTES.PORTAL} replace />} />
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
