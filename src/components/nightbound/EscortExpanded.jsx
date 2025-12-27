import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Shield, User, Car, Building, Brain, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function EscortExpanded({ human, onClose, earnings, reputation, setEarnings, setReputation }) {
  const [activeTab, setActiveTab] = useState('regulars');
  const [regulars, setRegulars] = useState([]);
  const [agency, setAgency] = useState(null);
  const [driver, setDriver] = useState(null);
  const [apartment, setApartment] = useState({ quality: 1, upgrades: [] });
  const [burnout, setBurnout] = useState(0);
  const [screening, setScreening] = useState({ tools: [], level: 1 });
  const queryClient = useQueryClient();

  const agencies = [
    { id: 'elite', name: 'Elite Companions', cut: 40, safety: 90, quality: 95, price: 500 },
    { id: 'upscale', name: 'Upscale Angels', cut: 35, safety: 75, quality: 80, price: 300 },
    { id: 'standard', name: 'Standard Agency', cut: 30, safety: 60, quality: 60, price: 150 }
  ];

  const driverOptions = [
    { id: 'basic', name: 'Part-time Driver', cost: 50, safety: 20, availability: 'evenings' },
    { id: 'pro', name: 'Professional Security', cost: 150, safety: 60, availability: 'anytime' },
    { id: 'bodyguard', name: 'Armed Bodyguard', cost: 300, safety: 90, availability: '24/7' }
  ];

  const apartmentUpgrades = [
    { id: 'lighting', name: 'Professional Lighting', cost: 200, attractiveness: 15 },
    { id: 'lingerie', name: 'Premium Lingerie Set', cost: 150, attractiveness: 20 },
    { id: 'sheets', name: 'Luxury Bedding', cost: 100, attractiveness: 10 },
    { id: 'shower', name: 'Upgraded Bathroom', cost: 400, attractiveness: 25 },
    { id: 'furniture', name: 'Quality Furniture', cost: 500, attractiveness: 30 },
    { id: 'soundproof', name: 'Soundproofing', cost: 300, privacy: 40 }
  ];

  const screeningTools = [
    { id: 'reverse', name: 'Reverse Image Search', cost: 0, effectiveness: 20 },
    { id: 'database', name: 'Client Database Access', cost: 100, effectiveness: 40 },
    { id: 'background', name: 'Background Check Service', cost: 200, effectiveness: 60 },
    { id: 'verification', name: 'ID Verification App', cost: 150, effectiveness: 50 }
  ];

  const generateRegular = () => {
    const names = ['Michael', 'James', 'Robert', 'David', 'Richard'];
    const regular = {
      id: Date.now(),
      name: names[Math.floor(Math.random() * names.length)],
      sessions: Math.floor(Math.random() * 10) + 3,
      loyalty: Math.floor(Math.random() * 50) + 50,
      possessiveness: Math.floor(Math.random() * 30),
      weeklyPay: Math.floor(Math.random() * 300) + 200,
      lastSeen: Date.now(),
      personality: ['respectful', 'generous', 'possessive', 'lonely', 'controlling'][Math.floor(Math.random() * 5)]
    };
    setRegulars([...regulars, regular]);
  };

  const meetRegular = async (regular) => {
    const possessiveRisk = regular.possessiveness > 50;
    
    let outcome = '';
    if (possessiveRisk && Math.random() > 0.7) {
      outcome = `${regular.name} is getting too attached.\n\n"I don't like you seeing other people," he says.\n\nHis tone is... concerning.\n\n+$${regular.weeklyPay}\n⚠️ Possessiveness increasing`;
      regular.possessiveness += 10;
      setBurnout(prev => Math.min(100, prev + 5));
    } else {
      outcome = `Session with ${regular.name}.\n\nConsistent. Safe. He's a regular for a reason.\n\n+$${regular.weeklyPay}`;
      regular.loyalty = Math.min(100, regular.loyalty + 5);
    }

    setEarnings(prev => prev + regular.weeklyPay);
    setReputation(prev => Math.min(100, prev + 2));

    await base44.entities.NightLog.create({
      entry: `${human.name} met with regular client ${regular.name} - ${outcome}`,
      category: 'interaction',
      intensity: possessiveRisk ? 'moderate' : 'subtle'
    });

    queryClient.invalidateQueries();
    alert(outcome);
  };

  const joinAgency = async (ag) => {
    setAgency(ag);
    setEarnings(prev => prev - ag.price);
    
    await base44.entities.NightLog.create({
      entry: `${human.name} joined ${ag.name} - ${ag.cut}% commission, ${ag.safety}% safety rating`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
    alert(`Joined ${ag.name}!\n\nThey take ${ag.cut}% cut\nBut provide screening, protection, and quality clients.`);
  };

  const hireDriver = async (driverOpt) => {
    if (earnings < driverOpt.cost) {
      alert('Not enough money!');
      return;
    }
    setDriver(driverOpt);
    setEarnings(prev => prev - driverOpt.cost);
    
    await base44.entities.NightLog.create({
      entry: `${human.name} hired ${driverOpt.name} - +${driverOpt.safety}% safety`,
      category: 'interaction',
      intensity: 'subtle'
    });

    queryClient.invalidateQueries();
    alert(`Hired ${driverOpt.name}!\n\n+${driverOpt.safety}% safety on bookings`);
  };

  const buyUpgrade = async (upgrade) => {
    if (earnings < upgrade.cost) {
      alert('Not enough money!');
      return;
    }
    if (apartment.upgrades.find(u => u.id === upgrade.id)) {
      alert('Already purchased!');
      return;
    }

    setEarnings(prev => prev - upgrade.cost);
    setApartment({ 
      ...apartment, 
      quality: apartment.quality + (upgrade.attractiveness || 0) / 20,
      upgrades: [...apartment.upgrades, upgrade]
    });

    alert(`Purchased ${upgrade.name}!\n\nYour incall space is more attractive to premium clients.`);
  };

  const buyScreeningTool = async (tool) => {
    if (earnings < tool.cost) {
      alert('Not enough money!');
      return;
    }
    if (screening.tools.find(t => t.id === tool.id)) {
      alert('Already have this!');
      return;
    }

    setEarnings(prev => prev - tool.cost);
    setScreening({
      ...screening,
      tools: [...screening.tools, tool],
      level: screening.level + tool.effectiveness / 100
    });

    alert(`Purchased ${tool.name}!\n\n+${tool.effectiveness}% screening effectiveness`);
  };

  const manageBurnout = () => {
    if (burnout < 30) return 'Low - You\'re doing fine';
    if (burnout < 60) return 'Moderate - Consider taking breaks';
    if (burnout < 80) return 'High - You need rest';
    return 'CRITICAL - You\'re exhausted';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-purple-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Business Management</h2>
              <p className="text-gray-400 text-sm">Grow your escort career</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Burnout warning */}
        {burnout > 50 && (
          <div className="bg-orange-950/40 border border-orange-500/30 rounded-xl p-3 mb-4">
            <p className="text-orange-300 text-sm text-center">
              ⚠️ Burnout: {burnout}% - {manageBurnout()}
            </p>
          </div>
        )}

        <div className="flex gap-2 border-b border-gray-700 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('regulars')}
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'regulars' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}
          >
            Regulars ({regulars.length})
          </button>
          <button
            onClick={() => setActiveTab('agency')}
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'agency' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}
          >
            Agency
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'security' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('incall')}
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'incall' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}
          >
            Incall Space
          </button>
          <button
            onClick={() => setActiveTab('screening')}
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'screening' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}
          >
            Screening
          </button>
        </div>

        {activeTab === 'regulars' && (
          <div className="space-y-4">
            <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
              <h3 className="text-white font-bold mb-2">👥 Regular Clients</h3>
              <p className="text-gray-300 text-sm">Repeat customers provide stable income</p>
            </div>

            <button
              onClick={generateRegular}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold"
            >
              Find New Regular
            </button>

            {regulars.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No regulars yet</p>
            ) : (
              <div className="space-y-3">
                {regulars.map(regular => (
                  <div key={regular.id} className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white font-bold">{regular.name}</h4>
                        <p className="text-gray-400 text-sm capitalize">{regular.personality}</p>
                      </div>
                      <span className="text-green-400 font-bold">${regular.weeklyPay}/wk</span>
                    </div>

                    <div className="space-y-1 text-xs mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sessions:</span>
                        <span className="text-white">{regular.sessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Loyalty:</span>
                        <span className="text-blue-400">{regular.loyalty}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Possessiveness:</span>
                        <span className={regular.possessiveness > 50 ? 'text-red-400' : 'text-green-400'}>
                          {regular.possessiveness}%
                        </span>
                      </div>
                    </div>

                    {regular.possessiveness > 70 && (
                      <div className="bg-red-950/40 border border-red-500/30 rounded-lg p-2 mb-2">
                        <p className="text-red-300 text-xs">⚠️ Getting too attached - might be dangerous</p>
                      </div>
                    )}

                    <button
                      onClick={() => meetRegular(regular)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-bold"
                    >
                      Meet This Week
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'agency' && (
          <div className="space-y-4">
            <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
              <h3 className="text-white font-bold mb-2">🏢 Escort Agencies</h3>
              <p className="text-gray-300 text-sm">Join an agency for safety and quality clients</p>
            </div>

            {agency ? (
              <div className="bg-green-950/40 border border-green-500/30 rounded-xl p-4">
                <h4 className="text-white font-bold mb-2">✓ Current Agency: {agency.name}</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">Commission: {agency.cut}%</p>
                  <p className="text-gray-300">Safety Rating: {agency.safety}%</p>
                  <p className="text-gray-300">Client Quality: {agency.quality}%</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {agencies.map(ag => (
                  <div key={ag.id} className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-4">
                    <h4 className="text-white font-bold mb-2">{ag.name}</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <p className="text-gray-400">Commission</p>
                        <p className="text-red-400 font-bold">{ag.cut}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Safety</p>
                        <p className="text-green-400 font-bold">{ag.safety}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Quality</p>
                        <p className="text-blue-400 font-bold">{ag.quality}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Join Fee</p>
                        <p className="text-yellow-400 font-bold">${ag.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => joinAgency(ag)}
                      disabled={earnings < ag.price}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-2 rounded-lg font-bold"
                    >
                      Join Agency
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4">
              <h3 className="text-white font-bold mb-2">🚗 Driver/Security</h3>
              <p className="text-gray-300 text-sm">Hire protection for high-risk bookings</p>
            </div>

            {driver ? (
              <div className="bg-green-950/40 border border-green-500/30 rounded-xl p-4">
                <h4 className="text-white font-bold mb-2">✓ Current: {driver.name}</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">Weekly Cost: ${driver.cost}</p>
                  <p className="text-gray-300">Safety Bonus: +{driver.safety}%</p>
                  <p className="text-gray-300">Available: {driver.availability}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {driverOptions.map(opt => (
                  <div key={opt.id} className="bg-gray-800/50 border border-blue-500/30 rounded-xl p-4">
                    <h4 className="text-white font-bold mb-2">{opt.name}</h4>
                    <div className="space-y-1 text-sm mb-3">
                      <p className="text-gray-300">Weekly: ${opt.cost}</p>
                      <p className="text-green-400">Safety: +{opt.safety}%</p>
                      <p className="text-blue-400">{opt.availability}</p>
                    </div>
                    <button
                      onClick={() => hireDriver(opt)}
                      disabled={earnings < opt.cost}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-2 rounded-lg font-bold"
                    >
                      Hire
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'incall' && (
          <div className="space-y-4">
            <div className="bg-pink-950/40 border border-pink-500/30 rounded-xl p-4">
              <h3 className="text-white font-bold mb-2">🏠 Incall Space</h3>
              <p className="text-gray-300 text-sm mb-3">Upgrade your apartment for better clients</p>
              <div className="bg-purple-950/40 rounded-lg p-2">
                <p className="text-purple-300 text-sm text-center">
                  Current Quality: {apartment.quality.toFixed(1)}/5 ⭐
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {apartmentUpgrades.map(upgrade => {
                const owned = apartment.upgrades.find(u => u.id === upgrade.id);
                return (
                  <div key={upgrade.id} className={`rounded-xl p-4 border ${
                    owned ? 'bg-green-950/40 border-green-500/30' : 'bg-gray-800/50 border-pink-500/30'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-white font-bold text-sm">{upgrade.name}</h4>
                        <p className="text-gray-400 text-xs">
                          {upgrade.attractiveness ? `+${upgrade.attractiveness}% attractiveness` : `+${upgrade.privacy}% privacy`}
                        </p>
                      </div>
                      <p className="text-yellow-400 font-bold text-sm">${upgrade.cost}</p>
                    </div>
                    {owned ? (
                      <p className="text-green-400 text-xs">✓ Installed</p>
                    ) : (
                      <button
                        onClick={() => buyUpgrade(upgrade)}
                        disabled={earnings < upgrade.cost}
                        className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 text-white py-2 rounded-lg text-xs font-bold"
                      >
                        Purchase
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'screening' && (
          <div className="space-y-4">
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
              <h3 className="text-white font-bold mb-2">🔍 Screening Tools</h3>
              <p className="text-gray-300 text-sm mb-3">Better screening = safer clients</p>
              <div className="bg-purple-950/40 rounded-lg p-2">
                <p className="text-purple-300 text-sm text-center">
                  Screening Level: {(screening.level * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {screeningTools.map(tool => {
                const owned = screening.tools.find(t => t.id === tool.id);
                return (
                  <div key={tool.id} className={`rounded-xl p-4 border ${
                    owned ? 'bg-green-950/40 border-green-500/30' : 'bg-gray-800/50 border-indigo-500/30'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-white font-bold text-sm">{tool.name}</h4>
                        <p className="text-gray-400 text-xs">+{tool.effectiveness}% effectiveness</p>
                      </div>
                      {tool.cost > 0 && <p className="text-yellow-400 font-bold text-sm">${tool.cost}</p>}
                    </div>
                    {owned ? (
                      <p className="text-green-400 text-xs">✓ Active</p>
                    ) : (
                      <button
                        onClick={() => buyScreeningTool(tool)}
                        disabled={tool.cost > 0 && earnings < tool.cost}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white py-2 rounded-lg text-xs font-bold"
                      >
                        {tool.cost === 0 ? 'Enable (Free)' : 'Purchase'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}