import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <style>{`
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        html, body {
          overflow-x: hidden;
          overscroll-behavior: none;
        }
        
        @keyframes gentleSway {
          0%, 100% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
        }
      `}</style>
      {children}
    </div>
  );
}