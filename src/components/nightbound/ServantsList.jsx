import React from 'react';
import { motion } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const VARIANT_DESCRIPTIONS = {
  devoted: 'Soft, earnest, emotionally anchored.',
  defiant: 'Controlled resistance through fascination.',
  dreamer: 'Detached, poetic, already half-gone.'
};

const STAGE_NAMES = ['Curious', 'Devoted', 'Dependent', 'Reverent', 'Bound'];

export default function ServantsList({ onClose, servants }) {
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
          onClick={onClose}
          className="absolute top-4 right-4 text-red-100/40 hover:text-red-100/80 transition-slow"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl text-red-100/80 font-light tracking-widest mb-6 text-center">
          Servants
        </h2>
        
        <div className="space-y-4">
          {servants.map((servant, i) => (
            <motion.div
              key={servant.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-6 hover:bg-red-950/20 transition-slow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-red-100/80 text-lg font-light tracking-wider">
                    {servant.name}
                  </h3>
                  <p className="text-red-100/40 text-xs uppercase tracking-widest mt-1">
                    {STAGE_NAMES[servant.obsession_stage - 1]}
                  </p>
                </div>
                
                <Link to={createPageUrl(`Messages?servant=${servant.id}`)}>
                  <button className="text-red-100/50 hover:text-red-100/80 transition-slow">
                    <MessageCircle className="w-5 h-5" strokeWidth={1} />
                  </button>
                </Link>
              </div>
              
              <p className="text-red-100/50 text-xs italic leading-relaxed mb-2">
                {VARIANT_DESCRIPTIONS[servant.variant]}
              </p>
              
              {servant.is_turned && (
                <p className="text-red-200/60 text-xs tracking-wider">
                  Turned
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}