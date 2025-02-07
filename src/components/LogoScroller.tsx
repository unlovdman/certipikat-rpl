import { Box } from '@mui/material';
import { keyframes } from '@mui/system';

const scroll = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-250px * 9));
  }
`;

const logos = [
  {
    src: '/rpl-logo.PNG',
    alt: 'RPL Logo',
  },
  {
    src: 'https://www.vectorlogo.zone/logos/java/java-icon.svg',
    alt: 'Java Logo',
  },
  {
    src: 'https://www.vectorlogo.zone/logos/springio/springio-icon.svg',
    alt: 'Spring Boot Logo',
  },
  {
    src: 'https://raw.githubusercontent.com/junit-team/junit5/86465f4f491219ad0c0cf9c64eddca7b0edeb86f/assets/img/junit5-logo.png',
    alt: 'Jacoco Logo',
  },
  {
    src: 'https://www.vectorlogo.zone/logos/mariadb/mariadb-icon.svg',
    alt: 'MariaDB Logo',
  },
  {
    src: 'https://www.vectorlogo.zone/logos/mysql/mysql-icon.svg',
    alt: 'MySQL Logo',
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Xampp_logo.svg',
    alt: 'XAMPP Logo',
  },
  {
    src: 'https://laragon.org/logo.svg',
    alt: 'Laragon Logo',
  },
  {
    src: 'https://www.vectorlogo.zone/logos/php/php-icon.svg',
    alt: 'PHP Logo',
  },
];

interface LogoScrollerProps {
  isBackground?: boolean;
}

export default function LogoScroller({ isBackground = false }: LogoScrollerProps) {
  return (
    <Box
      sx={{
        width: '100%',
        height: isBackground ? '100%' : '120px',
        position: isBackground ? 'absolute' : 'relative',
        overflow: 'hidden',
        background: isBackground ? 'transparent' : 'white',
        borderRadius: isBackground ? 0 : '16px',
        boxShadow: isBackground ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        mt: isBackground ? 0 : 4,
        top: isBackground ? 0 : 'auto',
        left: isBackground ? 0 : 'auto',
        right: isBackground ? 0 : 'auto',
        bottom: isBackground ? 0 : 'auto',
        zIndex: isBackground ? 0 : 1,
        opacity: isBackground ? 0.03 : 1,
        pointerEvents: isBackground ? 'none' : 'auto',
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          width: '250px',
          height: '100%',
          zIndex: 2,
          display: isBackground ? 'none' : 'block',
        },
        '&::before': {
          left: 0,
          background: 'linear-gradient(to right, white 0%, rgba(255, 255, 255, 0) 100%)',
        },
        '&::after': {
          right: 0,
          background: 'linear-gradient(to left, white 0%, rgba(255, 255, 255, 0) 100%)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 8,
          animation: `${scroll} ${isBackground ? 60 : 40}s linear infinite`,
          py: isBackground ? 8 : 3,
          px: 4,
          alignItems: 'center',
          flexWrap: isBackground ? 'wrap' : 'nowrap',
        }}
      >
        {[...logos, ...logos, ...logos].map((logo, index) => (
          <Box
            key={index}
            component="img"
            src={logo.src}
            alt={logo.alt}
            sx={{
              height: isBackground ? '80px' : '60px',
              width: isBackground ? '80px' : '60px',
              minWidth: isBackground ? '80px' : '60px',
              objectFit: 'contain',
              filter: 'grayscale(100%)',
              opacity: isBackground ? 0.7 : 0.7,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              backgroundColor: 'white',
              '&:hover': {
                filter: isBackground ? 'grayscale(100%)' : 'grayscale(0%)',
                opacity: isBackground ? 0.7 : 1,
                transform: isBackground ? 'none' : 'scale(1.15)',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
} 