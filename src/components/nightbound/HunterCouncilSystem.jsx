import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Crown, Users, Zap, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function HunterCouncilSystem({ hunter, onClose }) {
  const queryClient = useQueryClient();
  const [activeDecision, setActiveDecision] = useState(null);
  const [councilVote, setCouncilVote] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: hunters = [] } = useQuery({
    queryKey: ['hunters'],
    queryFn: () => base44.entities.Hunter.list()
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['hunterTeams'],
    queryFn: async () => {
      try {
        return await base44.entities.HunterTeam.list();
      } catch {
        return [];
      }
    }
  });

  const councilMembers = hunters.filter(h => h.status !== 'dead').slice(0, 5);
  const isCouncilMember = councilMembers.some(c => c.id === hunter.id);

  const decisions = [
    {
      id: 'expand_hunting',
      title: '🗺️ Expand Hunting Territory',
      description: 'Vote to expand hunting grounds and increase resources',
      effects: {
        positive: 'Increased hunting opportunities and funding',
        negative: 'May provoke vampire territories'
      },
      consequence: async () => {
        const newHunter = {
          name: 'New Recruit',
          skill_level: 30,
          specialty: 'tracker',
          status: 'tracking',
          experience: 0
        };
        await base44.entities.Hunter.create(newHunter);
        return 'New hunter recruit joined the organization!';
      }
    },
    {
      id: 'attack_vampire_nest',
      title: '⚔️ Coordinate Major Offensive',
      description: 'Launch a coordinated attack on a known vampire nest',
      effects: {
        positive: 'Eliminate vampire threat, gain fame',
        negative: 'Heavy casualties possible'
      },
      consequence: async () => {
        const vampireCasualtyRate = Math.random() * 0.7; // 0-70% casualties
        return `Major offensive launched! ${Math.round(vampireCasualtyRate * 100)}% casualties suffered.`;
      }
    },
    {
      id: 'enforce_law',
      title: '⚖️ Enforce Hunter Code',
      description: 'Vote to enforce strict hunter code - expel traitors',
      effects: {
        positive: 'Remove compromised hunters, strengthen unity',
        negative: 'May be too harsh'
      },
      consequence: async () => {
        const betrayedHunters = hunters.filter(h => h.is_betrayed);
        if (betrayedHunters.length > 0) {
          await Promise.all(
            betrayedHunters.map(h => 
              base44.entities.Hunter.update(h.id, { status: 'dead' })
            )
          );
          return `${betrayedHunters.length} traitors have been expunged from the records.`;
        }
        return 'No traitors found. Hunter code upheld.';
      }
    },
    {
      id: 'recruit_drive',
      title: '📢 Recruitment Drive',
      description: 'Increase recruitment efforts and training programs',
      effects: {
        positive: 'More hunters, larger army',
        negative: 'Less experienced recruits'
      },
      consequence: async () => {
        const numRecruit = Math.floor(Math.random() * 3) + 2;
        const specialties = ['tracker', 'researcher', 'combatant', 'infiltrator'];
        for (let i = 0; i < numRecruit; i++) {
          await base44.entities.Hunter.create({
            name: `New Recruit ${i + 1}`,
            skill_level: 25,
            specialty: specialties[Math.floor(Math.random() * specialties.length)],
            status: 'tracking',
            experience: 0
          });
        }
        return `${numRecruit} new hunters recruited and sent to training!`;
      }
    },
    {
      id: 'peace_treaty',
      title: '🤝 Negotiate Peace Treaty',
      description: 'Attempt to negotiate truce with vampire leaders',
      effects: {
        positive: 'Reduce conflict, prevent unnecessary deaths',
        negative: 'May appear weak to vampires'
      },
      consequence: async () => {
        const success = Math.random() > 0.5;
        return success
          ? 'Peace treaty negotiated! Hostilities reduced.'
          : 'Peace treaty rejected. Vampires see it as weakness.';
      }
    },
    {
      id: 'develop_weapons',
      title: '🔬 Develop New Weapons',
      description: 'Invest in research for better anti-vampire tech',
      effects: {
        positive: 'Better equipment for all hunters',
        negative: 'Expensive, takes time'
      },
      consequence: async () => {
        return 'New weapon systems developed! Hunter effectiveness +15%';
      }
    }
  ];

  const handleCouncilVote = async (decision) => {
    setLoading(true);
    try {
      const votes = Math.floor(Math.random() * councilMembers.length) + 1;
      const passed = votes > councilMembers.length / 2;

      if (passed) {
        const consequence = await decision.consequence();
        
        await base44.entities.NightLog.create({
          entry: `Council voted on "${decision.title}": PASSED (${votes}/${councilMembers.length} votes). ${consequence}`,
          category: 'council',
          intensity: 'significant'
        });
      } else {
        await base44.entities.NightLog.create({
          entry: `Council voted on "${decision.title}": REJECTED (${votes}/${councilMembers.length} votes)`,
          category: 'council',
          intensity: 'moderate'
        });
      }

      queryClient.invalidateQueries(['hunters']);
      queryClient.invalidateQueries(['logs']);
      setCouncilVote(passed);
      setTimeout(() => {
        setActiveDecision(null);
        setCouncilVote(null);
      }, 2500);
    } catch (e) {
      console.error('Council vote failed:', e);
    }
    setLoading(false);
  };

  if (activeDecision) {
    const decision = decisions.find(d => d.id === activeDecision);
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        onClick={() => setActiveDecision(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-2xl w-full border border-gray-800"
        >
          {councilVote !== null ? (
            <div className="text-center py-12">
              {councilVote ? (
                <>
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-green-400 text-2xl font-bold mb-2">Motion Passed</h3>
                  <p className="text-gray-400">{decision.description}</p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-4">❌</div>
                  <h3 className="text-red-400 text-2xl font-bold mb-2">Motion Rejected</h3>
                  <p className="text-gray-400">Not enough council support</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-3xl font-bold text-white">{decision.title}</h2>
                <button
                  onClick={() => setActiveDecision(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-300 text-lg mb-6">{decision.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 text-sm font-bold mb-2">✓ Benefits</p>
                  <p className="text-green-300 text-sm">{decision.effects.positive}</p>
                </div>
                <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 text-sm font-bold mb-2">✗ Risks</p>
                  <p className="text-red-300 text-sm">{decision.effects.negative}</p>
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 mb-8">
                <p className="text-gray-400 text-sm mb-2">Council Members ({councilMembers.length})</p>
                <div className="flex flex-wrap gap-2">
                  {councilMembers.map(member => (
                    <div
                      key={member.id}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        member.id === hunter.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {member.name}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleCouncilVote(decision)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-900/60 to-purple-950/60 hover:from-purple-900/80 hover:to-purple-950/80 disabled:from-gray-700 disabled:to-gray-700 border-2 border-purple-700/50 text-white font-bold py-4 rounded-xl transition-all"
              >
                {loading ? 'Voting...' : 'Cast Vote'}
              </button>
            </>
          )}
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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-2xl w-full border border-gray-800 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              Hunter Council
            </h2>
            {isCouncilMember && <p className="text-yellow-400 text-sm mt-1">You are a council member</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 mb-8">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Current Council ({councilMembers.length}/{hunters.length})
          </h3>
          <div className="space-y-2">
            {councilMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">
                  {member.name}
                  {member.id === hunter.id && <span className="text-purple-400 ml-2">★</span>}
                </span>
                <span className="text-gray-500">{member.specialty} • {member.skill_level}%</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-6">Vote on major decisions affecting all hunters:</p>

        <div className="space-y-3">
          {decisions.map(decision => (
            <motion.button
              key={decision.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setActiveDecision(decision.id)}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-left transition-colors border border-gray-700/30"
            >
              <h4 className="text-white font-bold">{decision.title}</h4>
              <p className="text-gray-400 text-sm">{decision.description}</p>
            </motion.button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}