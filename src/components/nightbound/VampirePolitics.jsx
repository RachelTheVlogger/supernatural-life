import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Crown, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function VampirePolitics({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [campaigning, setCampaigning] = useState(false);

  const { data: elections = [] } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      const existing = await base44.entities.VampireElection.list();
      if (existing.length === 0) {
        // Create ongoing elections
        const rivals = ['Elara the Ancient', 'Viktor Bloodworth', 'Morgana Darkspire'];
        for (const rival of rivals) {
          await base44.entities.VampireElection.create({
            election_type: ['elder_seat', 'territory_control', 'council_position'][Math.floor(Math.random() * 3)],
            candidate_name: rival,
            votes: Math.floor(Math.random() * 100),
            scandal_level: Math.floor(Math.random() * 50),
            is_player: false,
            election_status: 'active'
          });
        }
        return await base44.entities.VampireElection.list();
      }
      return existing;
    }
  });

  if (!vampireState) {
    return null;
  }

  const playerCampaign = elections.find(e => e.is_player && e.election_status === 'active');
  const rivalCampaigns = elections.filter(e => !e.is_player && e.election_status === 'active');

  const handleCampaign = async (action) => {
    if (!playerCampaign) {
      // Start campaign
      await base44.entities.VampireElection.create({
        election_type: 'council_position',
        candidate_name: vampireState.vampire_name,
        votes: 0,
        campaign_funds: 0,
        scandal_level: 0,
        is_player: true,
        election_status: 'active'
      });
      
      queryClient.invalidateQueries();
      return;
    }

    setCampaigning(true);
    
    setTimeout(async () => {
      let voteGain = 0;
      let fundsCost = 0;
      let scandalRisk = 0;
      let message = '';
      
      if (action === 'speech') {
        voteGain = Math.floor(Math.random() * 20) + 10;
        message = `Your speech swayed ${voteGain} vampires to your cause.`;
      } else if (action === 'bribe') {
        fundsCost = 500;
        voteGain = Math.floor(Math.random() * 30) + 20;
        scandalRisk = 20;
        message = `Bribed elders. Gained ${voteGain} votes but risk exposure.`;
      } else if (action === 'smear') {
        const target = rivalCampaigns[0];
        if (target) {
          await base44.entities.VampireElection.update(target.id, {
            scandal_level: Math.min(100, target.scandal_level + 30),
            votes: Math.max(0, target.votes - 15)
          });
        }
        scandalRisk = 40;
        message = `Smear campaign successful. Your hands are dirty.`;
      }
      
      await base44.entities.VampireElection.update(playerCampaign.id, {
        votes: playerCampaign.votes + voteGain,
        campaign_funds: playerCampaign.campaign_funds + fundsCost,
        scandal_level: Math.min(100, playerCampaign.scandal_level + scandalRisk)
      });
      
      await base44.entities.NightLog.create({
        entry: message,
        category: 'interaction',
        intensity: 'moderate'
      });
      
      queryClient.invalidateQueries();
      setCampaigning(false);
    }, 2000);
  };

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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">👑 Vampire Politics</h2>
        <p className="text-gray-400 text-sm mb-6">Power struggles and elections</p>

        {playerCampaign ? (
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mb-6">
            <h3 className="text-purple-400 font-bold mb-2">Your Campaign</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-gray-400 text-xs">Votes</p>
                <p className="text-white text-xl font-bold">{playerCampaign.votes}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Scandal</p>
                <p className="text-red-400 text-xl font-bold">{playerCampaign.scandal_level}%</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleCampaign('speech')}
                disabled={campaigning}
                className="flex-1 bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 rounded-lg py-2 text-sm disabled:opacity-50"
              >
                Give Speech
              </button>
              <button
                onClick={() => handleCampaign('bribe')}
                disabled={campaigning}
                className="flex-1 bg-yellow-900/40 hover:bg-yellow-900/60 text-yellow-300 rounded-lg py-2 text-sm disabled:opacity-50"
              >
                Bribe ($500)
              </button>
              <button
                onClick={() => handleCampaign('smear')}
                disabled={campaigning}
                className="flex-1 bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded-lg py-2 text-sm disabled:opacity-50"
              >
                Smear Rival
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => handleCampaign('start')}
            className="w-full bg-gradient-to-r from-purple-900/40 to-red-900/40 hover:from-purple-900/60 hover:to-red-900/60 border-2 border-purple-500/50 rounded-xl p-4 mb-6"
          >
            <Crown className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-white font-bold">Start Campaign</p>
          </button>
        )}

        <h3 className="text-white font-bold mb-3">Rival Candidates</h3>
        <div className="space-y-3">
          {rivalCampaigns.map(election => (
            <div key={election.id} className="bg-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-medium">{election.candidate_name}</h4>
                  <p className="text-gray-400 text-sm capitalize">{election.election_type.replace('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-400 text-sm">{election.votes} votes</p>
                  {election.scandal_level > 30 && (
                    <p className="text-red-400 text-xs">Scandal: {election.scandal_level}%</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}