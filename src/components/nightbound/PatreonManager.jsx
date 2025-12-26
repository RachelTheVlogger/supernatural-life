import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, DollarSign, Heart, Gift, Star, Crown, AlertTriangle, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import StalkerManagement from './StalkerManagement';

const TIERS = [
  { id: 1, name: 'Shadow Supporter', price: 5, icon: '🌙', perks: ['Early access to content', 'Patron-only posts', 'Thank you message'] },
  { id: 2, name: 'Dark Devotee', price: 15, icon: '🦇', perks: ['All previous perks', 'Behind-the-scenes content', 'Monthly Q&A', 'Custom requests'] },
  { id: 3, name: 'Eternal Patron', price: 50, icon: '👑', perks: ['All previous perks', 'Private Discord access', '1-on-1 video calls', 'Exclusive merchandise'] }
];

export default function PatreonManager({ servant, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [creating, setCreating] = useState(false);
  const [editingAccount, setEditingAccount] = useState(false);
  const [accountData, setAccountData] = useState({ account_name: '' });
  const [postContent, setPostContent] = useState('');
  const [selectedTier, setSelectedTier] = useState(null);
  const [showStalkers, setShowStalkers] = useState(false);

  const { data: accounts = [] } = useQuery({
    queryKey: ['patreon', servant.id],
    queryFn: () => base44.entities.PatreonAccount.filter({ servant_id: servant.id }),
    staleTime: 5000
  });

  const account = accounts[0];
  const hasAccount = !!account;

  const totalPatrons = hasAccount ? (account.tier_1_count + account.tier_2_count + account.tier_3_count) : 0;

  const { data: stalkers = [] } = useQuery({
    queryKey: ['stalkers', servant.id],
    queryFn: () => base44.entities.Stalker.filter({ servant_id: servant.id }),
    staleTime: 3000
  });



  const handleCreateAccount = async () => {
    await base44.entities.PatreonAccount.create({
      servant_id: servant.id,
      account_name: accountData.account_name || `${servant.name}'s Patreon`,
      patron_count: 0,
      monthly_revenue: 0,
      total_earned: 0,
      tier_1_count: 0,
      tier_2_count: 0,
      tier_3_count: 0
    });

    await base44.entities.NightLog.create({
      entry: `${servant.name} launched a Patreon: "${accountData.account_name}". Time to build a community.`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
    setEditingAccount(false);
  };

  const handlePostContent = async (tier) => {
    if (!postContent || creating) return;
    setCreating(true);

    setTimeout(async () => {
      const newPatrons = Math.floor(Math.random() * 10) + 5;
      const tierRevenue = tier === 'all' ? 0 : TIERS.find(t => t.id === tier).price;
      const earnings = newPatrons * (tier === 'all' ? 0 : tierRevenue);

      let tier1 = account.tier_1_count;
      let tier2 = account.tier_2_count;
      let tier3 = account.tier_3_count;

      if (tier === 1) tier1 += newPatrons;
      else if (tier === 2) tier2 += newPatrons;
      else if (tier === 3) tier3 += newPatrons;
      else {
        tier1 += Math.floor(newPatrons * 0.6);
        tier2 += Math.floor(newPatrons * 0.3);
        tier3 += Math.floor(newPatrons * 0.1);
      }

      const monthlyRevenue = (tier1 * 5) + (tier2 * 15) + (tier3 * 50);

      await base44.entities.PatreonAccount.update(account.id, {
        patron_count: tier1 + tier2 + tier3,
        tier_1_count: tier1,
        tier_2_count: tier2,
        tier_3_count: tier3,
        monthly_revenue: monthlyRevenue,
        total_earned: account.total_earned + earnings
      });

      await base44.entities.NightLog.create({
        entry: `Posted to Patreon: "${postContent}". +${newPatrons} new patrons. Monthly revenue now $${monthlyRevenue}.`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setCreating(false);
      setPostContent('');
      setSelectedTier(null);
    }, 2000);
  };

  const handleMonthlyPayout = async () => {
    if (account.monthly_revenue === 0) return;

    await base44.entities.PatreonAccount.update(account.id, {
      total_earned: account.total_earned + account.monthly_revenue
    });

    await base44.entities.NightLog.create({
      entry: `Patreon monthly payout: $${account.monthly_revenue}. Total earned: $${account.total_earned + account.monthly_revenue}.`,
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
          className="bg-gradient-to-br from-orange-600/20 to-gray-900 rounded-2xl p-8 max-w-md w-full text-center relative border-2 border-orange-500/30"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>

          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl mb-4"
          >
            🎨
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-3">Patreon</h2>
          <p className="text-gray-400 mb-8">
            Build a community. Offer exclusive content. Get paid monthly.
          </p>

          <button
            onClick={() => setEditingAccount(true)}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
          >
            Launch Patreon
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

          <h2 className="text-2xl font-bold text-white mb-6">Create Patreon Account</h2>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Account Name</label>
              <input
                type="text"
                value={accountData.account_name}
                onChange={(e) => setAccountData({...accountData, account_name: e.target.value})}
                placeholder={`${servant.name}'s Patreon`}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3"
              />
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Your Tiers</h3>
              {TIERS.map(tier => (
                <div key={tier.id} className="mb-3 p-3 bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{tier.icon}</span>
                    <div>
                      <p className="text-white font-medium">{tier.name}</p>
                      <p className="text-green-400 text-sm">${tier.price}/month</p>
                    </div>
                  </div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {tier.perks.map((perk, i) => (
                      <li key={i}>• {perk}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <button
              onClick={handleCreateAccount}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-xl transition-all"
            >
              Launch Patreon
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
        className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-orange-500/20"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-5xl">🎨</span>
          <div>
            <h2 className="text-2xl font-bold text-white">{account.account_name}</h2>
            <p className="text-gray-400 text-sm">Patreon Community</p>
          </div>
        </div>

        {/* Stalker Alert */}
        {stalkers.filter(s => s.platform === 'tiktok' && !s.blocked && s.danger_level !== 'harmless').length > 0 && (
          <div className="mb-4 bg-red-900/40 border-2 border-red-500/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-300 font-medium">
                  {stalkers.filter(s => s.platform === 'tiktok' && !s.blocked && s.danger_level !== 'harmless').length} Patreon Stalker{stalkers.filter(s => s.platform === 'tiktok' && !s.blocked && s.danger_level !== 'harmless').length > 1 ? 's' : ''}
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
          <div className="bg-orange-950/30 rounded-lg p-3 border border-orange-800/30">
            <Users className="w-5 h-5 text-orange-400 mb-1" />
            <p className="text-white text-xl font-bold">{totalPatrons}</p>
            <p className="text-gray-400 text-xs">Total Patrons</p>
          </div>
          <div className="bg-green-950/30 rounded-lg p-3 border border-green-800/30">
            <DollarSign className="w-5 h-5 text-green-400 mb-1" />
            <p className="text-white text-xl font-bold">${account.monthly_revenue}</p>
            <p className="text-gray-400 text-xs">Monthly Revenue</p>
          </div>
          <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-800/30">
            <Heart className="w-5 h-5 text-purple-400 mb-1" />
            <p className="text-white text-xl font-bold">${account.total_earned}</p>
            <p className="text-gray-400 text-xs">Total Earned</p>
          </div>
          <div className="bg-blue-950/30 rounded-lg p-3 border border-blue-800/30">
            <Star className="w-5 h-5 text-blue-400 mb-1" />
            <p className="text-white text-xl font-bold">{account.tier_3_count}</p>
            <p className="text-gray-400 text-xs">Top Tier</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setTab('overview')} className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'overview' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            📊 Overview
          </button>
          <button onClick={() => setTab('post')} className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'post' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            ✍️ Post
          </button>
          <button onClick={() => setTab('tiers')} className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'tiers' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            👑 Tiers
          </button>
          <button onClick={() => setTab('stalkers')} className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm relative ${tab === 'stalkers' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            ⚠️ Stalkers
            {stalkers.filter(s => s.platform === 'tiktok' && !s.blocked && s.danger_level !== 'harmless').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {stalkers.filter(s => s.platform === 'tiktok' && !s.blocked && s.danger_level !== 'harmless').length}
              </span>
            )}
          </button>
          <button onClick={() => setTab('payout')} className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'payout' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            💰 Payout
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="text-white font-bold mb-3">Patron Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">🌙 Shadow Supporter ($5)</span>
                  <span className="text-white font-bold">{account.tier_1_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">🦇 Dark Devotee ($15)</span>
                  <span className="text-white font-bold">{account.tier_2_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">👑 Eternal Patron ($50)</span>
                  <span className="text-white font-bold">{account.tier_3_count}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* POST TAB */}
        {tab === 'post' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <h3 className="text-white text-xl font-bold">Create Patron-Only Post</h3>
            
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Exclusive content for your patrons..."
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 h-32"
            />

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Who can see this?</label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedTier('all')}
                  className={`w-full p-3 rounded-lg text-left ${selectedTier === 'all' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                >
                  All Patrons
                </button>
                {TIERS.map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`w-full p-3 rounded-lg text-left ${selectedTier === tier.id ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                  >
                    <span className="mr-2">{tier.icon}</span>
                    {tier.name} and above
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handlePostContent(selectedTier)}
              disabled={!postContent || selectedTier === null || creating}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-bold py-4 rounded-xl disabled:opacity-50"
            >
              {creating ? '⚡ Posting...' : '📤 POST TO PATRONS'}
            </button>
          </div>
        )}

        {/* TIERS TAB */}
        {tab === 'tiers' && (
          <div className="space-y-3 max-h-[55vh] overflow-y-auto">
            {TIERS.map(tier => (
              <div key={tier.id} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{tier.icon}</span>
                  <div>
                    <h4 className="text-white font-bold">{tier.name}</h4>
                    <p className="text-green-400 font-medium">${tier.price}/month</p>
                  </div>
                </div>
                <ul className="space-y-1 text-sm text-gray-300 mb-3">
                  {tier.perks.map((perk, i) => (
                    <li key={i}>✓ {perk}</li>
                  ))}
                </ul>
                <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                  <span className="text-gray-400 text-sm">Current Patrons</span>
                  <span className="text-white font-bold">{tier.id === 1 ? account.tier_1_count : tier.id === 2 ? account.tier_2_count : account.tier_3_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STALKERS TAB */}
        {tab === 'stalkers' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            {stalkers.filter(s => s.platform === 'tiktok').length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-green-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400">No stalkers on Patreon yet.</p>
              </div>
            ) : (
              stalkers.filter(s => s.platform === 'tiktok').map(stalker => {
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

        {/* PAYOUT TAB */}
        {tab === 'payout' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-2 border-green-500/30 rounded-2xl p-6 text-center">
              <DollarSign className="w-16 h-16 text-green-400 mx-auto mb-3" />
              <h3 className="text-white text-2xl font-bold mb-2">Monthly Revenue</h3>
              <p className="text-green-400 text-4xl font-bold mb-4">${account.monthly_revenue}</p>
              <button
                onClick={handleMonthlyPayout}
                disabled={account.monthly_revenue === 0}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-bold py-4 rounded-xl disabled:opacity-50"
              >
                Collect Monthly Payout
              </button>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3">Lifetime Earnings</h4>
              <p className="text-green-400 text-3xl font-bold">${account.total_earned}</p>
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
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}