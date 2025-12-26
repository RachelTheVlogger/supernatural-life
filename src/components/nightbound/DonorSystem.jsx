import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Droplets, Shield, Zap, DollarSign, TrendingUp } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const DONOR_NAMES = ['Adrian', 'Maya', 'Elijah', 'Iris', 'Dante', 'Luna', 'Silas', 'Celeste'];

const FEEDING_STYLES = [
  { id: 'gentle', label: '🌙 Gentle', health: -5, trust: 5, attachment: 3, desc: 'Slow and careful. Minimal discomfort.' },
  { id: 'standard', label: '🩸 Standard', health: -10, trust: 2, attachment: 1, desc: 'Quick and efficient.' },
  { id: 'deep', label: '💉 Deep Feed', health: -20, trust: -5, attachment: 5, desc: 'Intense. Euphoric for them. Risky.' },
  { id: 'intimate', label: '❤️ Intimate', health: -10, trust: 10, attachment: 10, desc: 'Close. Personal. Bonding.' }
];

const ARRANGEMENTS = [
  { value: 'financial', label: '💰 Financial', desc: 'You pay them regularly' },
  { value: 'protection', label: '🛡️ Protection', desc: 'You keep them safe' },
  { value: 'thrill-seeker', label: '⚡ Thrill', desc: 'They do it for excitement' },
  { value: 'devoted', label: '❤️ Devoted', desc: 'They do it out of love' },
  { value: 'addicted', label: '💉 Addicted', desc: 'They crave your bite' }
];

export default function DonorSystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [finding, setFinding] = useState(false);
  const [feeding, setFeeding] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: donors = [] } = useQuery({
    queryKey: ['donors'],
    queryFn: () => base44.entities.Donor.list()
  });

  const findDonor = async () => {
    setFinding(true);

    setTimeout(async () => {
      const name = DONOR_NAMES[Math.floor(Math.random() * DONOR_NAMES.length)];
      const bloodTypes = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
      const arrangements = ['financial', 'protection', 'thrill-seeker'];

      await base44.entities.Donor.create({
        name,
        gender: Math.random() > 0.5 ? 'woman' : 'man',
        blood_type: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
        health: 100,
        willingness: 40 + Math.floor(Math.random() * 30),
        attachment: 0,
        trust: 20 + Math.floor(Math.random() * 20),
        arrangement: arrangements[Math.floor(Math.random() * arrangements.length)],
        frequency: 'weekly',
        boundaries: ['no-pain', 'privacy'],
        knows_truth: true,
        wants_to_be_turned: false
      });

      queryClient.invalidateQueries(['donors']);
      setFinding(false);
    }, 2000);
  };

  const feedFromDonor = async (donor, style) => {
    setFeeding(true);

    setTimeout(async () => {
      const feedStyle = FEEDING_STYLES.find(s => s.id === style);
      
      const newHealth = Math.max(0, donor.health + feedStyle.health);
      const newTrust = Math.min(100, Math.max(0, donor.trust + feedStyle.trust));
      const newAttachment = Math.min(100, donor.attachment + feedStyle.attachment);
      const newWillingness = donor.willingness + (newTrust > donor.trust ? 5 : -5);

      await base44.entities.Donor.update(donor.id, {
        health: newHealth,
        trust: newTrust,
        attachment: newAttachment,
        willingness: Math.min(100, Math.max(0, newWillingness)),
        days_since_donation: 0,
        total_donations: donor.total_donations + 1,
        last_interaction: new Date().toISOString()
      });

      if (vampireState?.id) {
        await base44.entities.VampireState.update(vampireState.id, {
          hunger_state: 'sated'
        });
      }

      const outcomes = {
        gentle: `You fed gently from ${donor.name}. They barely felt it. A quiet moment of trust between you.`,
        standard: `${donor.name} offered their wrist. You drank. Business as usual. They're already scheduling next week.`,
        deep: `You sank deep into ${donor.name}'s neck. Their eyes rolled back. Euphoria washed over them. They'll be thinking about this for days.`,
        intimate: `You held ${donor.name} close. The feeding was slow, personal. Their heartbeat synced with yours. This meant something to both of you.`
      };

      setOutcome(outcomes[style]);

      await base44.entities.NightLog.create({
        entry: `Fed from ${donor.name}. Style: ${feedStyle.label}. Health: ${newHealth}. Trust: ${newTrust}.`,
        category: 'feeding',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setFeeding(false);
        setOutcome('');
        setSelectedDonor(null);
      }, 4000);
    }, 2000);
  };

  const improveBond = async (donor) => {
    const newTrust = Math.min(100, donor.trust + 10);
    const newAttachment = Math.min(100, donor.attachment + 5);

    await base44.entities.Donor.update(donor.id, {
      trust: newTrust,
      attachment: newAttachment
    });

    queryClient.invalidateQueries(['donors']);
  };

  return (
    <AnimatePresence>
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
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-red-900/30"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Droplets className="w-6 h-6 text-red-400" />
                Donors
              </h2>
              <p className="text-gray-400 text-sm">Consensual feeding arrangements</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {!selectedDonor ? (
            <>
              <button
                onClick={findDonor}
                disabled={finding}
                className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 text-white font-medium py-3 rounded-xl mb-6 disabled:opacity-50 transition-all"
              >
                {finding ? 'Searching...' : '+ Find New Donor'}
              </button>

              {donors.length === 0 ? (
                <div className="text-center py-12">
                  <Droplets className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No donors yet. Find someone willing to feed you.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {donors.map(donor => {
                    const arrangement = ARRANGEMENTS.find(a => a.value === donor.arrangement);
                    return (
                      <button
                        key={donor.id}
                        onClick={() => setSelectedDonor(donor)}
                        className="w-full bg-gray-800/50 hover:bg-gray-800 border border-red-900/30 rounded-xl p-4 text-left transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-white font-bold">{donor.name}</h3>
                            <p className="text-gray-400 text-sm capitalize">{donor.blood_type} • {donor.frequency}</p>
                          </div>
                          <span className="text-2xl">{arrangement?.label.split(' ')[0]}</span>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500">Health</p>
                            <p className="text-white font-medium">{donor.health}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Trust</p>
                            <p className="text-white font-medium">{donor.trust}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Attachment</p>
                            <p className="text-white font-medium">{donor.attachment}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Donations</p>
                            <p className="text-white font-medium">{donor.total_donations}</p>
                          </div>
                        </div>

                        {donor.days_since_donation < 7 && (
                          <p className="text-yellow-400 text-xs mt-2">⚠️ Too soon since last feeding</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div>
              <button
                onClick={() => setSelectedDonor(null)}
                className="text-gray-400 hover:text-white mb-4 text-sm"
              >
                ← Back to donors
              </button>

              <div className="bg-gray-800/30 rounded-xl p-6 mb-6 border border-red-900/20">
                <h3 className="text-white text-2xl font-bold mb-2">{selectedDonor.name}</h3>
                <p className="text-gray-400 mb-4 capitalize">
                  {ARRANGEMENTS.find(a => a.value === selectedDonor.arrangement)?.desc}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Health</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          style={{ width: `${selectedDonor.health}%` }}
                          className="h-2 bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                        />
                      </div>
                      <span className="text-white text-sm">{selectedDonor.health}%</span>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Trust</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          style={{ width: `${selectedDonor.trust}%` }}
                          className="h-2 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                        />
                      </div>
                      <span className="text-white text-sm">{selectedDonor.trust}%</span>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Attachment</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          style={{ width: `${selectedDonor.attachment}%` }}
                          className="h-2 bg-gradient-to-r from-purple-600 to-pink-400 rounded-full"
                        />
                      </div>
                      <span className="text-white text-sm">{selectedDonor.attachment}%</span>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Willingness</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          style={{ width: `${selectedDonor.willingness}%` }}
                          className="h-2 bg-gradient-to-r from-green-600 to-green-400 rounded-full"
                        />
                      </div>
                      <span className="text-white text-sm">{selectedDonor.willingness}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 text-xs text-gray-400">
                  <span>Donated {selectedDonor.total_donations} times</span>
                  <span>•</span>
                  <span>{selectedDonor.days_since_donation} days since last</span>
                </div>
              </div>

              <h4 className="text-white font-medium mb-3">Feed from {selectedDonor.name}</h4>
              <div className="grid grid-cols-1 gap-2 mb-4">
                {FEEDING_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => feedFromDonor(selectedDonor, style.id)}
                    disabled={selectedDonor.days_since_donation < 7 || selectedDonor.health < 30}
                    className="bg-gray-800/50 hover:bg-gray-700 disabled:bg-gray-900/50 border border-red-900/30 rounded-lg p-3 text-left disabled:opacity-50 transition-all"
                  >
                    <p className="text-white font-medium">{style.label}</p>
                    <p className="text-gray-400 text-xs">{style.desc}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={() => improveBond(selectedDonor)}
                className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg py-2 text-white text-sm transition-all"
              >
                Spend time together (+Trust, +Attachment)
              </button>
            </div>
          )}

          {(finding || feeding) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-60 flex items-center justify-center bg-black/80"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Droplets className="w-16 h-16 text-red-400" />
              </motion.div>
            </motion.div>
          )}

          {outcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4"
            >
              <motion.div className="bg-gray-900 rounded-2xl p-6 max-w-md text-center border-2 border-red-500/50">
                <p className="text-white text-lg leading-relaxed">{outcome}</p>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}