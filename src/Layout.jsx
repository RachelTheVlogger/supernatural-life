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
        
        /* Glassmorphism */
        .glass {
          background: rgba(20, 0, 0, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(100, 0, 0, 0.1);
        }
        
        /* Marble background animation */
        @keyframes marbleDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-2%, -2%) scale(1.02); }
        }
        
        /* Smooth transitions */
        .transition-slow {
          transition: all 500ms cubic-bezier(0.4, 0.0, 0.2, 1);
        }
      `}</style>
      
      {/* Animated marble background */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 40%, rgba(80, 0, 0, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(40, 0, 0, 0.2) 0%, transparent 50%)',
          animation: 'marbleDrift 40s ease-in-out infinite'
        }}
      />
      
      {/* Dust particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="fixed w-1 h-1 bg-red-200/10 rounded-full pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${20 + Math.random() * 20}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 10}s`
          }}
        />
      ))}
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.1; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.3; }
        }
      `}</style>
      
      {children}
    </div>
  );
}