import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 0.4;
  }
`;

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 8,
        right: 12,
        zIndex: 10,
        animation: `${fadeIn} 2s ease-in-out forwards`,
        opacity: 0,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontFamily: '"Playfair Display", serif',
          fontSize: '0.7rem',
          color: 'text.secondary',
          letterSpacing: '0.05em',
          fontStyle: 'italic',
          userSelect: 'none',
          '&:hover': {
            opacity: 0.7,
          },
          transition: 'opacity 0.3s ease',
        }}
      >
        『Mit Liebe erschaffen von unlovdman』
      </Typography>
    </Box>
  );
} 