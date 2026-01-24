import React from 'react';
import { Home, Moon, User, Sparkles, Zap, Waves, Droplets, Dna } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ErrorBoundary from '@/components/ErrorBoundary';
import AutoErrorRecovery from '@/components/AutoErrorRecovery';
import { motion } from 'framer-motion';

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showServantSelector, setShowServantSelector] = React.useState(false);
  
  // Fetch servants for navigation
  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: async () => {
      try {
        return await base44.entities.Servant.list();
      } catch (e) {
        console.error('Failed to fetch servants:', e);
        return [];
      }
    },
    retry: 1
  });

  const { data: witches = [] } = useQuery({
    queryKey: ['witches'],
    queryFn: async () => {
      try {
        return await base44.entities.Witch.list();
      } catch (e) {
        console.error('Failed to fetch witches:', e);
        return [];
      }
    },
    retry: 1
  });

  const { data: sirens = [] } = useQuery({
    queryKey: ['sirens'],
    queryFn: async () => {
      try {
        return await base44.entities.Siren.list();
      } catch (e) {
        console.error('Failed to fetch sirens:', e);
        return [];
      }
    },
    retry: 1
  });

  const { data: nymphs = [] } = useQuery({
    queryKey: ['waterNymphs'],
    queryFn: async () => {
      try {
        return await base44.entities.WaterNymph.list();
      } catch (e) {
        console.error('Failed to fetch nymphs:', e);
        return [];
      }
    },
    retry: 1
  });

  const { data: mutants = [] } = useQuery({
    queryKey: ['mutants'],
    queryFn: async () => {
      try {
        return await base44.entities.Mutant.list();
      } catch (e) {
        console.error('Failed to fetch mutants:', e);
        return [];
      }
    },
    retry: 1
  });

  const { data: heretics = [] } = useQuery({
    queryKey: ['heretics'],
    queryFn: async () => {
      try {
        return await base44.entities.Heretic.list();
      } catch (e) {
        console.error('Failed to fetch heretics:', e);
        return [];
      }
    },
    retry: 1
  });
  
  // Show nav on main game pages only
  const showNav = ['Night', 'VampireHome', 'ServantHome', 'WitchHome', 'WerewolfHome', 'SirenHome', 'WaterNymphHome', 'MutantHome', 'HereticHome'].includes(currentPageName);
  
  // Get current servant from URL or default to first
  const urlParams = new URLSearchParams(location.search);
  const urlServantId = urlParams.get('servant') || urlParams.get('id');
  const currentServant = urlServantId ? servants.find(s => s.id === urlServantId) : servants[0];
  const currentServantId = currentServant?.id;
  const firstServantId = currentServant?.id || (servants.length > 0 ? servants[0].id : null);

  const urlNymphId = urlParams.get('nymph');
  const firstNymphId = urlNymphId ? nymphs.find(n => n.id === urlNymphId)?.id : (nymphs.length > 0 ? nymphs[0].id : null);

  const urlSirenId = urlParams.get('siren');
  const firstSirenId = urlSirenId ? sirens.find(s => s.id === urlSirenId)?.id : (sirens.length > 0 ? sirens[0].id : null);

  const urlMutantId = urlParams.get('mutant');
  const firstMutantId = urlMutantId ? mutants.find(m => m.id === urlMutantId)?.id : (mutants.length > 0 ? mutants[0].id : null);

  const urlHereticId = urlParams.get('heretic');
  const firstHereticId = urlHereticId ? heretics.find(h => h.id === urlHereticId)?.id : (heretics.length > 0 ? heretics[0].id : null);

  const navItems = [
    { name: 'Night', icon: Moon, path: 'Night' },
    { name: 'Vamp', icon: Home, path: 'VampireHome' },
    { name: 'Servant', icon: User, path: `ServantHome?id=${firstServantId}`, hasSelector: servants.length > 1, disabled: servants.length === 0 },
    { name: 'Witch', icon: Sparkles, path: 'WitchHome', show: witches.length > 0 },
    { name: 'Siren', icon: Waves, path: `SirenHome?id=${firstSirenId}`, show: sirens.length > 0, hasSelector: sirens.length > 1, disabled: sirens.length === 0 },
    { name: 'Nymph', icon: Droplets, path: `WaterNymphHome?id=${firstNymphId}`, hasSelector: nymphs.length > 1, disabled: nymphs.length === 0 },
    { name: 'Mutant', icon: Dna, path: `MutantHome?id=${firstMutantId}`, show: mutants.length > 0, hasSelector: mutants.length > 1, disabled: mutants.length === 0 },
    { name: 'Heretic', icon: Zap, path: `HereticHome?id=${firstHereticId}`, show: heretics.length > 0, hasSelector: heretics.length > 1, disabled: heretics.length === 0 }
  ];
  
  return (
    <ErrorBoundary>
    <AutoErrorRecovery>
    <div className="min-h-screen bg-black relative pb-20 overflow-x-hidden">
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
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-purple-900/30 z-50">
          <div className="flex items-center justify-around px-2 py-2 gap-1">
            {navItems.filter(item => item.show !== false).map(item => {
              const Icon = item.icon;
              const isActive = currentPageName === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.disabled) return;
                    if (item.hasSelector && servants.length > 1) {
                      setShowServantSelector(true);
                    } else {
                      navigate(createPageUrl(item.path));
                    }
                  }}
                  disabled={item.disabled}
                  className={`flex flex-col items-center gap-0.5 flex-shrink-0 px-1 py-1 relative ${
                    isActive ? 'text-purple-400' : item.disabled ? 'text-gray-700' : 'text-gray-400 active:text-purple-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium whitespace-nowrap">{item.name}</span>
                  {item.hasSelector && servants.length > 1 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[10px] rounded-full flex items-center justify-center">
                      {servants.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Multi-selector Modal */}
      {showServantSelector && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90"
          onClick={() => setShowServantSelector(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-white text-xl font-bold mb-4">Select Character</h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {servants.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    navigate(createPageUrl(`ServantHome?id=${s.id}`));
                    setShowServantSelector(false);
                  }}
                  className={`w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors ${
                    s.id === currentServantId ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  <h4 className="text-white font-medium">{s.name}</h4>
                  <p className="text-gray-400 text-sm capitalize">
                    {s.is_turned ? '🦇 Vampire' : `${s.variant} servant`} • Bond: {s.relationship || 0}%
                  </p>
                </button>
              ))}
              {sirens.map(si => (
                <button
                  key={si.id}
                  onClick={() => {
                    navigate(createPageUrl(`SirenHome?id=${si.id}`));
                    setShowServantSelector(false);
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                >
                  <h4 className="text-white font-medium">{si.name}</h4>
                  <p className="text-gray-400 text-sm">🌊 Siren • Voice: {si.voice_power}%</p>
                </button>
              ))}
              {nymphs.map(n => (
                <button
                  key={n.id}
                  onClick={() => {
                    navigate(createPageUrl(`WaterNymphHome?id=${n.id}`));
                    setShowServantSelector(false);
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                >
                  <h4 className="text-white font-medium">{n.name}</h4>
                  <p className="text-gray-400 text-sm">💧 Nymph • Bond: {n.nature_bond}%</p>
                </button>
              ))}
              {mutants.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    navigate(createPageUrl(`MutantHome?id=${m.id}`));
                    setShowServantSelector(false);
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                >
                  <h4 className="text-white font-medium">{m.name}</h4>
                  <p className="text-gray-400 text-sm">🧬 Mutant • Power: {m.power_level}%</p>
                </button>
              ))}
              {heretics.map(h => (
                <button
                  key={h.id}
                  onClick={() => {
                    navigate(createPageUrl(`HereticHome?id=${h.id}`));
                    setShowServantSelector(false);
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                >
                  <h4 className="text-white font-medium">{h.name}</h4>
                  <p className="text-gray-400 text-sm">⚡ Heretic • Balance: {h.balance}%</p>
                </button>
              ))}
              </div>
          </motion.div>
        </motion.div>
      )}
    </div>
    </AutoErrorRecovery>
    </ErrorBoundary>
    );
    }