import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RestingMessage({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-40"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 1.5 }}
        >
          <p 
            className="text-sm font-light tracking-widest"
            style={{ 
              color: 'rgba(107, 92, 76, 0.5)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            The garden is resting.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}