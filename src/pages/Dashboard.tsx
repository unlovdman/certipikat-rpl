import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Fade,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import { 
  LogoutRounded, 
  CloudDownload, 
  Person, 
  Assignment, 
  School,
  Book,
  Schedule
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  checkStudentStatus, 
  isAslab, 
  PraktikumType,
  PraktikumPeriod,
  PraktikumNotAvailableError,
  getCurrentPeriod,
  getAvailablePeriods
} from '../utils/excelUtils';
import { getCertificatePage } from '../utils/pdfUtils';
import LogoScroller from '../components/LogoScroller';

interface StudentInfo {
  npm: string;
  nama: string;
  status: 'lulus' | 'tidak lulus';
  isAslab: boolean;
  praktikum: {
    type: PraktikumType;
    period: PraktikumPeriod;
  };
}

const PRAKTIKUM_LIST: PraktikumType[] = ['PBO', 'Basis Data'];

export default function Dashboard() {
  const { npm, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [selectedPraktikum, setSelectedPraktikum] = useState<PraktikumType>('PBO');
  const [selectedPeriod, setSelectedPeriod] = useState<PraktikumPeriod>(getCurrentPeriod());
  const [availablePeriods, setAvailablePeriods] = useState<PraktikumPeriod[]>([]);

  useEffect(() => {
    setAvailablePeriods(getAvailablePeriods(selectedPraktikum));
  }, [selectedPraktikum]);

  useEffect(() => {
    if (!isAuthenticated || !npm) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [studentData, aslabStatus] = await Promise.all([
          checkStudentStatus(npm, selectedPraktikum, selectedPeriod),
          isAslab(npm, selectedPraktikum, selectedPeriod),
        ]);

        if (studentData) {
          setStudentInfo({
            npm: studentData.npm,
            nama: studentData.nama || 'Nama tidak ditemukan',
            status: studentData.status,
            isAslab: aslabStatus,
            praktikum: {
              type: selectedPraktikum,
              period: selectedPeriod
            }
          });
        } else {
          setError(`NPM tidak ditemukan dalam daftar praktikan ${selectedPraktikum} periode ${selectedPeriod}`);
          setStudentInfo(null);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err instanceof PraktikumNotAvailableError) {
          setError(`${err.message}. Silakan cek kembali pada semester yang sesuai.`);
        } else {
          setError('Terjadi kesalahan teknis. Silakan hubungi administrator laboratorium.');
        }
        setStudentInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [npm, isAuthenticated, navigate, selectedPraktikum, selectedPeriod]);

  const handleDownloadCertificate = async () => {
    if (!studentInfo) return;

    try {
      setDownloading(true);
      setError('');
      
      // Show loading message for mobile
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      if (isMobile) {
        setError('Mohon tunggu, sedang memproses sertifikat...');
      }
      
      const result = await getCertificatePage(studentInfo.npm, studentInfo.isAslab);
      
      if (!result.blob) {
        throw new Error('Sertifikat tidak ditemukan');
      }

      // Verify blob is valid
      if (result.blob.size === 0) {
        throw new Error('File sertifikat kosong');
      }
      
      // Clear the loading message
      setError('');
      
      try {
        // For mobile, create a blob with the correct filename
        if (isMobile) {
          const file = new File([result.blob], result.filename, {
            type: 'application/pdf'
          });
          
          const url = window.URL.createObjectURL(file);
          
          // Create and click a download link
          const link = document.createElement('a');
          link.href = url;
          link.download = result.filename;
          link.type = 'application/pdf';
          
          // Try to trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 1000);
        } else {
          // Desktop download handling
          const url = window.URL.createObjectURL(result.blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = result.filename;
          link.type = 'application/pdf';
          
          // Try to trigger download
          try {
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } finally {
            window.URL.revokeObjectURL(url);
          }
        }
      } catch (downloadError) {
        console.error('Download mechanics error:', downloadError);
        throw new Error('Gagal mendownload file sertifikat');
      }
    } catch (err) {
      console.error('Download error:', err);
      if (err instanceof Error) {
        setError(`Gagal mengunduh sertifikat: ${err.message}`);
      } else {
        setError('Gagal mengunduh sertifikat. Silakan coba lagi nanti.');
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)',
        }}
        role="status"
        aria-label="Memuat data"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <CircularProgress size={40} aria-label="Loading" />
        </motion.div>
      </Box>
    );
  }

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
          background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
          py: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <LogoScroller isBackground />
        <Container component="main" maxWidth="md">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                position: 'relative',
              }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.3,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 4,
                  }}
                >
                  <img
                    src="/rpl-logo.PNG"
                    alt="Logo RPL - Rekayasa Perangkat Lunak"
                    style={{ 
                      width: '180px',
                      filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                    }}
                  />
                </Box>
              </motion.div>

              <Typography
                component="h1"
                variant="h4"
                align="center"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 4,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {/* Dashboard Sertifikat PBO bos */}
              </Typography>

              <Stack spacing={2} sx={{ mb: 4 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="praktikum-select-label">Pilih Praktikum</InputLabel>
                  <Select
                    labelId="praktikum-select-label"
                    value={selectedPraktikum}
                    onChange={(e) => setSelectedPraktikum(e.target.value as PraktikumType)}
                    label="Pilih Praktikum"
                    startAdornment={<Book sx={{ mr: 1, ml: -0.5 }} />}
                    sx={{
                      borderRadius: '12px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(25, 118, 210, 0.2)',
                      },
                    }}
                  >
                    {PRAKTIKUM_LIST.map((praktikum) => (
                      <MenuItem key={praktikum} value={praktikum}>
                        Praktikum {praktikum}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth variant="outlined">
                  <InputLabel id="period-select-label">Pilih Periode</InputLabel>
                  <Select
                    labelId="period-select-label"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as PraktikumPeriod)}
                    label="Pilih Periode"
                    startAdornment={<Schedule sx={{ mr: 1, ml: -0.5 }} />}
                    sx={{
                      borderRadius: '12px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(25, 118, 210, 0.2)',
                      },
                    }}
                  >
                    {availablePeriods.map((period) => (
                      <MenuItem key={period} value={period}>
                        Periode {period}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

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
                        mb: 3,
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

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : studentInfo && (
                <Fade in timeout={800}>
                  <Box>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(25, 118, 210, 0.2)',
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        color="primary"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontWeight: 600,
                        }}
                      >
                        <Person /> Informasi Mahasiswa
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Assignment sx={{ color: 'text.secondary' }} />
                          <Typography variant="body1">
                            <strong>NPM:</strong> {studentInfo.npm}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person sx={{ color: 'text.secondary' }} />
                          <Typography variant="body1">
                            <strong>Nama:</strong>{' '}
                            {studentInfo.nama === 'Nama tidak ditemukan' ? (
                              <Box component="span" sx={{ color: 'warning.main' }}>
                                {studentInfo.nama}
                              </Box>
                            ) : (
                              studentInfo.nama
                            )}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Book sx={{ color: 'text.secondary' }} />
                          <Typography variant="body1">
                            <strong>Praktikum:</strong> {studentInfo.praktikum.type} Periode {studentInfo.praktikum.period}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <School sx={{ color: 'text.secondary' }} />
                          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <strong>Status:</strong>
                            <Box
                              component="span"
                              sx={{
                                px: 2,
                                py: 0.5,
                                borderRadius: '20px',
                                backgroundColor: studentInfo.isAslab
                                  ? 'primary.main'
                                  : studentInfo.status === 'lulus'
                                  ? 'success.main'
                                  : 'warning.main',
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              {studentInfo.isAslab
                                ? 'Asisten Laboratorium'
                                : studentInfo.status === 'lulus'
                                ? 'Lulus'
                                : 'Belum Lulus'}
                            </Box>
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>

                    {(studentInfo.status === 'lulus' || studentInfo.isAslab) && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={handleDownloadCertificate}
                          disabled={downloading}
                          startIcon={<CloudDownload />}
                          sx={{
                            py: 2,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                            boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.39)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                            },
                          }}
                        >
                          {downloading ? (
                            <>
                              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                              Mengunduh...
                            </>
                          ) : (
                            'Unduh Sertifikat'
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </Box>
                </Fade>
              )}

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={logout}
                    startIcon={<LogoutRounded />}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 500,
                      px: 4,
                      py: 1.5,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                      },
                    }}
                  >
                    Keluar
                  </Button>
                </motion.div>
              </Box>
            </Paper>
          </motion.div>
          <Box sx={{ mt: 4 }}>
            <LogoScroller />
          </Box>
        </Container>
      </Box>
    </motion.div>
  );
} 