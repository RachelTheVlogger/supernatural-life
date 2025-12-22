import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewFlowerMessage({ show, onDismiss }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          onClick={onDismiss}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Message */}
          <motion.div
            className="relative text-center"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <p 
              className="text-2xl md:text-3xl font-light tracking-wide"
              style={{ 
                color: '#6b5c4c',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.05em'
              }}
            >
              A new plant baby has appeared.
            </p>
            
            <motion.p
              className="mt-6 text-sm tracking-widest uppercase opacity-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1.5 }}
            >
              tap to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}