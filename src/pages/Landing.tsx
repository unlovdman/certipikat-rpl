import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
} from '@mui/material';

const ROUTES = {
  AUTH: '/s2crt',
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Grid 
          container 
          spacing={4} 
          alignItems="center" 
          justifyContent="center"
        >
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              textAlign: { xs: 'center', md: 'left' }, 
              mb: { xs: 4, md: 0 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', md: 'flex-start' },
            }}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Sertifikat Laboratorium
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 4, lineHeight: 1.5 }}
              >
                Portal Sertifikat Digital Laboratorium Rekayasa Perangkat Lunak
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(ROUTES.AUTH)}
                sx={{
                  py: 2,
                  px: 4,
                  borderRadius: '30px',
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.39)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.39)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Masuk ke Portal
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <img
              src="/rpl-logo-titled.PNG"
              alt="RPL Logo"
              style={{
                width: '100%',
                maxWidth: '500px',
                display: 'block',
                margin: '0 auto',
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 