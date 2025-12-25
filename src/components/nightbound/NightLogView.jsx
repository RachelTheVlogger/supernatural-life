import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { format } from 'date-fns';

export default function NightLogView({ onClose, logs }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-2xl p-8 md:p-12 max-w-2xl w-full relative max-h-[80vh] overflow-y-auto"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-red-100/40 hover:text-red-100/80 transition-slow z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl text-red-100/80 font-light tracking-widest mb-8 text-center">
          Night Log
        </h2>
        
        <div className="space-y-6">
          {logs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border-l-2 border-red-900/30 pl-4"
            >
              <p className="text-red-100/40 text-xs uppercase tracking-wider mb-1">
                {format(new Date(log.created_date), 'MMM d, h:mm a')}
              </p>
              <p className="text-red-100/70 text-sm leading-relaxed italic">
                {log.entry}
              </p>
            </motion.div>
          ))}
          
          {logs.length === 0 && (
            <p className="text-red-100/40 text-sm italic text-center py-12">
              No entries yet. The night awaits.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}