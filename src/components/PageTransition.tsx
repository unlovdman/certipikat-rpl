import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 1,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 1,
  },
};

const contentVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const overlayVariants = {
  initial: {
    x: '100%',
  },
  in: {
    x: '100%',
  },
  out: {
    x: '0%',
  },
};

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', minHeight: '100vh' }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          style={{
            width: '100%',
            minHeight: '100vh',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Main Content */}
          <motion.div
            variants={contentVariants}
            transition={{
              duration: 0.4,
              ease: 'easeInOut',
            }}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {children}
          </motion.div>

          {/* Transition Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={{
              duration: 0.4,
              ease: 'easeInOut',
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100vh',
              background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 