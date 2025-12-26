import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Shield, Eye, Ban, Scale, UserX } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const DANGER_COLORS = {
  harmless: 'bg-gray-700 text-gray-300',
  concerning: 'bg-yellow-900/50 text-yellow-300',
  threatening: 'bg-orange-900/50 text-orange-300',
  dangerous: 'bg-red-900/50 text-red-300',
  critical: 'bg-red-600 text-white'
};

const ACTIONS = [
  { id: 'block', label: 'Block on Platform', icon: Ban, cost: 0 },
  { id: 'report', label: 'Report to Platform', icon: AlertTriangle, cost: 0 },
  { id: 'investigate', label: 'Hire Private Investigator', icon: Eye, cost: 500 },
  { id: 'restraining', label: 'File Restraining Order', icon: Scale, cost: 1000 },
  { id: 'security', label: 'Hire Security', icon: Shield, cost: 2000 }
];

export default function StalkerManagement({ servant, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: stalkers = [] } = useQuery({
    queryKey: ['stalkers', servant.id],
    queryFn: () => base44.entities.Stalker.filter({ servant_id: servant.id }, '-obsession_level')
  });

  const handleAction = async (stalker, action) => {
    setProcessing(true);

    setTimeout(async () => {
      let newObsession = stalker.obsession_level;
      let message = '';

      switch (action.id) {
        case 'block':
          await base44.entities.Stalker.update(stalker.id, { blocked: true });
          newObsession = Math.max(0, stalker.obsession_level - 10);
          message = `Blocked ${stalker.username}. They can't contact you on ${stalker.platform} anymore.`;
          break;
        
        case 'report':
          const reported = Math.random() > 0.3;
          if (reported) {
            await base44.entities.Stalker.update(stalker.id, { 
              blocked: true,
              obsession_level: Math.max(0, stalker.obsession_level - 20)
            });
            message = `Platform banned ${stalker.username}. Account deleted.`;
          } else {
            message = `Platform said ${stalker.username} didn't violate guidelines. Report denied.`;
          }
          break;
        
        case 'investigate':
          const found = Math.random() > 0.4;
          if (found) {
            const names = ['Michael', 'Brandon', 'Tyler', 'Chris', 'Derek'];
            const realName = names[Math.floor(Math.random() * names.length)];
            await base44.entities.Stalker.update(stalker.id, { 
              real_name: realName,
              obsession_level: Math.max(0, stalker.obsession_level - 15)
            });
            message = `Investigator found their identity: ${realName}. Evidence collected.`;
          } else {
            message = `Investigator couldn't trace them. Too careful.`;
          }
          break;
        
        case 'restraining':
          if (!stalker.real_name) {
            message = `Can't file restraining order without their real identity. Hire investigator first.`;
            setOutcome(message);
            setProcessing(false);
            setTimeout(() => setOutcome(''), 3000);
            return;
          }
          await base44.entities.Stalker.update(stalker.id, { 
            restraining_order: true,
            obsession_level: Math.max(0, stalker.obsession_level - 30)
          });
          message = `Restraining order granted against ${stalker.real_name}. Legally protected.`;
          break;
        
        case 'security':
          await base44.entities.Stalker.update(stalker.id, { 
            obsession_level: Math.max(0, stalker.obsession_level - 40),
            danger_level: 'harmless'
          });
          message = `Security hired. ${stalker.username} backed off. You're protected.`;
          break;
      }

      await base44.entities.NightLog.create({
        entry: `${servant.name} dealt with stalker ${stalker.username}. ${message}`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries(['stalkers']);
      setOutcome(message);

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          Stalker Management
        </h2>
        <p className="text-gray-400 text-sm mb-6">Handle obsessive followers. Stay safe.</p>

        {stalkers.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-green-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400">No stalkers detected. You're safe for now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stalkers.map(stalker => (
              <div key={stalker.id} className="bg-gray-800 rounded-xl p-4 border-2 border-red-900/30">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-bold">{stalker.username}</h3>
                    {stalker.real_name && (
                      <p className="text-red-400 text-sm">Real name: {stalker.real_name}</p>
                    )}
                    <p className="text-gray-400 text-xs capitalize">{stalker.platform}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded text-xs ${DANGER_COLORS[stalker.danger_level]}`}>
                      {stalker.danger_level}
                    </span>
                    <p className="text-gray-400 text-xs mt-1">Obsession: {stalker.obsession_level}%</p>
                  </div>
                </div>

                {stalker.behavior_patterns?.length > 0 && (
                  <div className="mb-3 bg-black/40 rounded p-2">
                    <p className="text-red-300 text-xs font-medium mb-1">Recent Activity:</p>
                    {stalker.behavior_patterns.slice(-3).map((behavior, i) => (
                      <p key={i} className="text-gray-400 text-xs">• {behavior}</p>
                    ))}
                  </div>
                )}

                {stalker.has_address && (
                  <div className="mb-3 bg-red-900/30 border border-red-500/50 rounded p-2">
                    <p className="text-red-300 text-xs font-bold">⚠️ THEY KNOW YOUR ADDRESS</p>
                  </div>
                )}

                {stalker.restraining_order && (
                  <div className="mb-3 bg-green-900/30 border border-green-500/50 rounded p-2">
                    <p className="text-green-300 text-xs">✓ Restraining order active</p>
                  </div>
                )}

                {stalker.blocked && (
                  <div className="mb-3 bg-gray-900/50 rounded p-2">
                    <p className="text-gray-400 text-xs">Blocked on {stalker.platform}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {ACTIONS.map(action => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(stalker, action)}
                      disabled={processing || (action.id === 'block' && stalker.blocked)}
                      className="bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white px-3 py-2 rounded text-xs flex items-center gap-2"
                    >
                      <action.icon className="w-3 h-3" />
                      {action.label}
                      {action.cost > 0 && <span className="text-yellow-400">${action.cost}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {processing && !outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Shield className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              </motion.div>
              <p className="text-white">Processing...</p>
            </div>
          </motion.div>
        )}

        {outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4"
          >
            <div className="bg-gray-900 rounded-xl p-6 max-w-md text-center">
              <p className="text-white">{outcome}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}