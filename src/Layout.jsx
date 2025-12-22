import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <style>{`
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        body {
          background: #000000;
          overflow-x: hidden;
        }
        
        .bitlife-btn {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
          border: none;
          color: white;
          font-weight: 500;
          transition: all 300ms ease;
        }
        
        .bitlife-btn:hover {
          background: linear-gradient(135deg, #6d28d9 0%, #9333ea 100%);
          transform: translateY(-1px);
        }
        
        .bitlife-btn:active {
          transform: translateY(0);
        }
        
        /* Smooth transitions */
        .transition-slow {
          transition: all 500ms cubic-bezier(0.4, 0.0, 0.2, 1);
        }
      `}</style>
      
      {children}
    </div>
  );
}