import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ROUTES = {
  HOME: '/',
  PORTAL: '/p0rt4l',
};

export default function Login() {
  const [npm, setNpm] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!npm || !password) {
        setError('NPM dan Password tidak boleh kosong');
        return;
      }

      if (password.length !== 5) {
        setError('Password harus 5 digit terakhir NPM');
        return;
      }

      const lastFiveDigits = npm.slice(-5);
      if (password !== lastFiveDigits) {
        setError('Password harus 5 digit terakhir dari NPM');
        return;
      }

      const success = await login(npm);
      if (success) {
        navigate(ROUTES.PORTAL);
      } else {
        setError('NPM atau Password tidak valid');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            onClick={() => navigate(ROUTES.HOME)}
            startIcon={<ArrowBack />}
            sx={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              color: '#1976d2',
              fontSize: '1rem',
              textTransform: 'none',
              padding: '8px 16px',
              borderRadius: '12px',
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Kembali
          </Button>
        </motion.div>

        <Container component="main" maxWidth="xs">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Box
              sx={{
                mt: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderRadius: '24px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <motion.img
                  src="/rpl-logo-titled.PNG"
                  alt="Logo RPL - Rekayasa Perangkat Lunak"
                  style={{ 
                    width: '180px', 
                    marginBottom: '24px',
                  }}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.4,
                  }}
                />
                <Typography
                  component="h1"
                  variant="h5"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    textAlign: 'center',
                  }}
                >
                  {/* Login dulu bang  */}
                </Typography>
                
                <Box 
                  component="form" 
                  onSubmit={handleSubmit} 
                  sx={{ width: '100%' }}
                  noValidate
                  aria-label="Form Login"
                >
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Alert 
                          severity="error" 
                          sx={{ 
                            mb: 2,
                            borderRadius: '12px',
                          }}
                          role="alert"
                          aria-live="polite"
                        >
                          {error}
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="npm"
                      label="NPM"
                      name="npm"
                      autoComplete="username"
                      autoFocus
                      value={npm}
                      onChange={(e) => setNpm(e.target.value)}
                      inputProps={{
                        'aria-label': 'Masukkan NPM',
                        'aria-required': 'true',
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                          '&:hover fieldset': {
                            borderColor: '#1976d2',
                          },
                          '&.Mui-focused fieldset': {
                            borderWidth: '2px',
                          },
                        },
                      }}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="password"
                      label="Password (5 digit terakhir NPM)"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{
                                color: theme => theme.palette.primary.main,
                              }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        'aria-label': 'Masukkan password (5 digit terakhir NPM)',
                        'aria-required': 'true',
                        maxLength: 5,
                        pattern: '[0-9]*',
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                          '&:hover fieldset': {
                            borderColor: '#1976d2',
                          },
                          '&.Mui-focused fieldset': {
                            borderWidth: '2px',
                          },
                        },
                      }}
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{
                        mt: 3,
                        mb: 2,
                        py: 1.5,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                        boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.39)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(25, 118, 210, 0.39)',
                        },
                        transition: 'all 0.3s ease-in-out',
                      }}
                      aria-label="Tombol Login"
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Masuk'
                      )}
                    </Button>
                  </motion.div>
                </Box>
              </Paper>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </motion.div>
  );
} 