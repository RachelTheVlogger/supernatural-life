import React from 'react';
import { Home, Moon, User, MessageCircle, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Fetch servants for navigation
  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list(),
    enabled: ['Night', 'VampireHome', 'ServantHome', 'Messages'].includes(currentPageName)
  });
  
  // Show nav on main game pages only
  const showNav = ['Night', 'VampireHome', 'ServantHome', 'Messages'].includes(currentPageName);
  
  const firstServantId = servants.length > 0 ? servants[0].id : null;
  
  const navItems = [
    { name: 'Night', icon: Moon, path: 'Night' },
    { name: 'House', icon: Home, path: 'VampireHome' },
    { name: 'Servant', icon: User, path: `ServantHome?id=${firstServantId}`, disabled: !firstServantId },
    { name: 'Messages', icon: MessageCircle, path: `Messages?servant=${firstServantId}`, disabled: !firstServantId },
  
  ];
  
  return (
    <ErrorBoundary>
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
                  onClick={() => !item.disabled && navigate(createPageUrl(item.path))}
                  disabled={item.disabled}
                  className={`flex flex-col items-center gap-1 touch-manipulation ${
                    isActive ? 'text-purple-400' : item.disabled ? 'text-gray-700' : 'text-gray-400 active:text-white'
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
    </ErrorBoundary>
  );
}