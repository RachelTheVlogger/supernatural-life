import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, DollarSign, Camera, Eye, Send, Zap, AlertTriangle, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import StalkerManagement from './StalkerManagement';

const SNAP_TYPES = [
  { id: 'selfie', label: 'Selfie', icon: '📸', outcomes: ['Mirror selfie. Looking good.', 'Late night selfie vibes.', 'Messy hair. Don\'t care.'] },
  { id: 'outfit', label: 'Outfit Check', icon: '👗', outcomes: ['Today\'s fit check.', 'New outfit. What do you think?', 'Getting ready for the night.'] },
  { id: 'tease', label: 'Teasing', icon: '😈', outcomes: ['Feeling myself today.', 'Just for you 💋', 'Can\'t show you everything here.'] },
  { id: 'intimate', label: 'Intimate', icon: '🔥', outcomes: ['Private moment.', 'You\'re lucky to see this.', 'Don\'t screenshot 😉'], premium: true },
  { id: 'behind', label: 'Behind Scenes', icon: '🎬', outcomes: ['Behind the camera.', 'This is what we don\'t post.', 'Raw and unfiltered.'] }
];

export default function SnapchatPremium({ servant, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('send');
  const [creating, setCreating] = useState(false);
  const [editingAccount, setEditingAccount] = useState(false);
  const [accountData, setAccountData] = useState({ username: '', monthly_price: 20 });
  const [selectedType, setSelectedType] = useState(null);
  const [message, setMessage] = useState('');
  const [filmWithVampire, setFilmWithVampire] = useState(false);
  const [showStalkers, setShowStalkers] = useState(false);

  const { data: accounts = [] } = useQuery({
    queryKey: ['snapchat-premium', servant.id],
    queryFn: () => base44.entities.SnapchatPremium.filter({ servant_id: servant.id }),
    staleTime: 5000
  });

  const account = accounts[0];
  const hasAccount = !!account;

  const { data: stalkers = [] } = useQuery({
    queryKey: ['stalkers', servant.id],
    queryFn: () => base44.entities.Stalker.filter({ servant_id: servant.id }),
    staleTime: 3000
  });



  const handleCreateAccount = async () => {
    await base44.entities.SnapchatPremium.create({
      servant_id: servant.id,
      username: accountData.username || `${servant.name}_premium`,
      monthly_price: accountData.monthly_price,
      subscriber_count: 0,
      revenue: 0,
      snap_count: 0,
      story_views: 0
    });

    await base44.entities.NightLog.create({
      entry: `${servant.name} started a premium Snapchat: @${accountData.username}. Exclusive access only.`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
    setEditingAccount(false);
  };

  const handleSendSnap = async () => {
    if (!selectedType || creating) return;
    setCreating(true);

    setTimeout(async () => {
      const snapType = SNAP_TYPES.find(s => s.id === selectedType);
      const outcome = snapType.outcomes[Math.floor(Math.random() * snapType.outcomes.length)];
      
      const views = Math.floor(account.subscriber_count * (Math.random() * 0.3 + 0.6));
      const newSubs = Math.floor(Math.random() * 15) + 5;
      const earnings = newSubs * account.monthly_price;

      await base44.entities.SnapchatPremium.update(account.id, {
        subscriber_count: account.subscriber_count + newSubs,
        revenue: account.revenue + earnings,
        snap_count: account.snap_count + 1,
        story_views: account.story_views + views
      });

      if (filmWithVampire) {
        const relBonus = Math.floor(Math.random() * 8) + 6;
        await base44.entities.Servant.update(servant.id, {
          relationship: Math.min(100, (servant.relationship || 0) + relBonus)
        });
      }

      await base44.entities.NightLog.create({
        entry: `Sent snap: "${outcome}". ${message ? `Caption: "${message}"` : ''} ${views} views. +${newSubs} new subs. $${earnings} earned.`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setCreating(false);
      setSelectedType(null);
      setMessage('');
      setFilmWithVampire(false);
    }, 2500);
  };

  const handleMassMessage = async () => {
    const earnings = account.subscriber_count * 5;
    
    await base44.entities.SnapchatPremium.update(account.id, {
      revenue: account.revenue + earnings
    });

    await base44.entities.NightLog.create({
      entry: `Sent mass message to all premium subscribers. $${earnings} from tips.`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
  };

  if (!hasAccount && !editingAccount) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-yellow-600/20 to-gray-900 rounded-2xl p-8 max-w-md w-full text-center relative border-2 border-yellow-500/30"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>

          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl mb-4"
          >
            👻
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-3">Premium Snapchat</h2>
          <p className="text-gray-400 mb-8">
            Private snaps. Exclusive stories. Direct access to your biggest fans.
          </p>

          <button
            onClick={() => setEditingAccount(true)}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
          >
            Start Premium Snapchat
          </button>
        </motion.div>
      </motion.div>
    );
  }

  if (editingAccount) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold text-white mb-6">Create Premium Snapchat</h2>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Username</label>
              <input
                type="text"
                value={accountData.username}
                onChange={(e) => setAccountData({...accountData, username: e.target.value})}
                placeholder={`${servant.name}_premium`}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Monthly Subscription Price</label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 20, 30].map(price => (
                  <button
                    key={price}
                    onClick={() => setAccountData({...accountData, monthly_price: price})}
                    className={`px-4 py-3 rounded-lg ${accountData.monthly_price === price ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                  >
                    ${price}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateAccount}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all"
            >
              Launch Premium Snap
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-yellow-500/20"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-5xl">👻</span>
          <div>
            <h2 className="text-2xl font-bold text-white">@{account.username}</h2>
            <p className="text-gray-400 text-sm">Premium Snapchat • ${account.monthly_price}/month</p>
          </div>
        </div>

        {/* Stalker Alert */}
        {stalkers.filter(s => s.platform === 'snapchat' && !s.blocked && s.danger_level !== 'harmless').length > 0 && (
          <div className="mb-4 bg-red-900/40 border-2 border-red-500/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-300 font-medium">
                  {stalkers.filter(s => s.platform === 'snapchat' && !s.blocked && s.danger_level !== 'harmless').length} Snapchat Stalker{stalkers.filter(s => s.platform === 'snapchat' && !s.blocked && s.danger_level !== 'harmless').length > 1 ? 's' : ''}
                </span>
              </div>
              <button onClick={() => setShowStalkers(true)} className="text-red-400 hover:text-red-300 text-sm">
                Manage →
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-yellow-950/30 rounded-lg p-3 border border-yellow-800/30">
            <Users className="w-5 h-5 text-yellow-400 mb-1" />
            <p className="text-white text-xl font-bold">{account.subscriber_count}</p>
            <p className="text-gray-400 text-xs">Subscribers</p>
          </div>
          <div className="bg-green-950/30 rounded-lg p-3 border border-green-800/30">
            <DollarSign className="w-5 h-5 text-green-400 mb-1" />
            <p className="text-white text-xl font-bold">${account.revenue}</p>
            <p className="text-gray-400 text-xs">Revenue</p>
          </div>
          <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-800/30">
            <Camera className="w-5 h-5 text-purple-400 mb-1" />
            <p className="text-white text-xl font-bold">{account.snap_count}</p>
            <p className="text-gray-400 text-xs">Snaps Sent</p>
          </div>
          <div className="bg-blue-950/30 rounded-lg p-3 border border-blue-800/30">
            <Eye className="w-5 h-5 text-blue-400 mb-1" />
            <p className="text-white text-xl font-bold">{account.story_views}</p>
            <p className="text-gray-400 text-xs">Story Views</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setTab('send')} className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'send' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            📸 Send Snap
          </button>
          <button onClick={() => setTab('mass')} className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'mass' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            💬 Mass Message
          </button>
          <button onClick={() => setTab('stalkers')} className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm relative ${tab === 'stalkers' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            ⚠️ Stalkers
            {stalkers.filter(s => s.platform === 'snapchat' && !s.blocked && s.danger_level !== 'harmless').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {stalkers.filter(s => s.platform === 'snapchat' && !s.blocked && s.danger_level !== 'harmless').length}
              </span>
            )}
          </button>
          <button onClick={() => setTab('stats')} className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'stats' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            📊 Stats
          </button>
        </div>

        {/* SEND TAB */}
        {tab === 'send' && !selectedType && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <h3 className="text-white text-xl font-bold mb-3">What kind of snap?</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SNAP_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-center transition-all ${
                    type.premium ? 'border-2 border-red-500/50' : ''
                  }`}
                >
                  <div className="text-4xl mb-2">{type.icon}</div>
                  <h4 className="text-white font-medium text-sm">{type.label}</h4>
                  {type.premium && <p className="text-red-400 text-xs mt-1">🔥 Hot</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'send' && selectedType && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <button onClick={() => { setSelectedType(null); setMessage(''); setFilmWithVampire(false); }} className="text-yellow-400 text-sm">
              ← Back
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">{SNAP_TYPES.find(s => s.id === selectedType).icon}</span>
              <h3 className="text-white text-xl font-bold">{SNAP_TYPES.find(s => s.id === selectedType).label}</h3>
            </div>

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a caption... (optional)"
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3"
            />

            <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filmWithVampire}
                onChange={(e) => setFilmWithVampire(e.target.checked)}
                className="rounded"
              />
              Include {vampireState.vampire_name} in snap
            </label>

            <button
              onClick={handleSendSnap}
              disabled={creating}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-bold py-4 rounded-xl disabled:opacity-50"
            >
              {creating ? '📤 Sending...' : '👻 SEND SNAP'}
            </button>
          </div>
        )}

        {/* MASS MESSAGE TAB */}
        {tab === 'mass' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-purple-950/40 to-pink-950/40 border-2 border-purple-500/30 rounded-2xl p-6 text-center">
              <Send className="w-16 h-16 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white text-2xl font-bold mb-2">Mass Message</h3>
              <p className="text-gray-300 mb-4">Send a message to all {account.subscriber_count} subscribers</p>
              <p className="text-green-400 text-sm mb-6">Expected tips: ~${account.subscriber_count * 5}</p>
              
              <button
                onClick={handleMassMessage}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl"
              >
                Send to All Subscribers
              </button>
            </div>
          </div>
        )}

        {/* STALKERS TAB */}
        {tab === 'stalkers' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            {stalkers.filter(s => s.platform === 'snapchat').length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-green-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400">No stalkers on Snapchat yet.</p>
              </div>
            ) : (
              stalkers.filter(s => s.platform === 'snapchat').map(stalker => {
                const DANGER_COLORS = {
                  harmless: 'bg-gray-700 text-gray-300',
                  concerning: 'bg-yellow-900/50 text-yellow-300',
                  threatening: 'bg-orange-900/50 text-orange-300',
                  dangerous: 'bg-red-900/50 text-red-300',
                  critical: 'bg-red-600 text-white'
                };
                
                return (
                  <div key={stalker.id} className="bg-gray-800 rounded-xl p-4 border-2 border-red-900/30">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-bold">{stalker.username}</h3>
                        {stalker.real_name && <p className="text-red-400 text-sm">Real: {stalker.real_name}</p>}
                      </div>
                      <span className={`px-3 py-1 rounded text-xs ${DANGER_COLORS[stalker.danger_level]}`}>
                        {stalker.danger_level}
                      </span>
                    </div>
                    {stalker.behavior_patterns?.length > 0 && (
                      <div className="mb-3 bg-black/40 rounded p-2">
                        <p className="text-red-300 text-xs font-medium mb-1">Activity:</p>
                        {stalker.behavior_patterns.slice(-3).map((b, i) => (
                          <p key={i} className="text-gray-400 text-xs">• {b}</p>
                        ))}
                      </div>
                    )}
                    <button onClick={() => setShowStalkers(true)} className="w-full bg-red-900/40 hover:bg-red-900/60 text-red-300 py-2 rounded-lg text-sm">
                      Manage
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* STATS TAB */}
        {tab === 'stats' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="text-white font-bold mb-3">Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Views per Snap</span>
                  <span className="text-white font-bold">
                    {account.snap_count > 0 ? Math.floor(account.story_views / account.snap_count) : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Recurring</span>
                  <span className="text-green-400 font-bold">${account.subscriber_count * account.monthly_price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">View Rate</span>
                  <span className="text-white font-bold">
                    {account.subscriber_count > 0 && account.snap_count > 0
                      ? Math.floor((account.story_views / (account.snap_count * account.subscriber_count)) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stalker Modal */}
        <AnimatePresence>
          {showStalkers && (
            <StalkerManagement
              servant={servant}
              onClose={() => setShowStalkers(false)}
            />
          )}

          {creating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-7xl"
              >
                👻
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}