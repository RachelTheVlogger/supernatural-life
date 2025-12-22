import React from 'react';

import { Home, Moon, User, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Show nav on main game pages only
  const showNav = ['Night', 'VampireHome', 'ServantHome', 'Messages'].includes(currentPageName);
  
  const navItems = [
    { name: 'Night', icon: Moon, path: 'Night' },
    { name: 'Sanctuary', icon: Home, path: 'VampireHome' },
    { name: 'Servant', icon: User, path: 'ServantHome' },
    { name: 'Messages', icon: MessageCircle, path: 'Messages' }
  ];
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-20">
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

      {showNav && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-purple-900/30 z-50">
          <div className="flex justify-around items-center px-4 py-3">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPageName === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(createPageUrl(item.path))}
                  className={`flex flex-col items-center gap-1 transition-colors ${
                    isActive ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      </div>
      );
      }