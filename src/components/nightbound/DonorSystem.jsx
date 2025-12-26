import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Droplets, Shield, Zap, DollarSign, TrendingUp, Calendar, Coffee, Home } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const DONOR_NAMES = ['Tessa', 'Adrian', 'Maya', 'Elijah', 'Iris', 'Dante', 'Luna', 'Silas', 'Celeste'];

const FEEDING_STYLES = [
  { id: 'gentle', label: '🌙 Gentle & Protective', health: -5, trust: 8, attachment: 5, payment: 200, desc: 'You hold them carefully. Check on them after. Make sure they feel safe.' },
  { id: 'scheduled', label: '📅 Scheduled Appointment', health: -10, trust: 5, attachment: 3, payment: 150, desc: 'Professional. Comfortable. Exactly as the agency outlined.' },
  { id: 'intimate', label: '❤️ Sweet & Intimate', health: -8, trust: 10, attachment: 15, payment: 0, desc: 'Soft touches. Whispered reassurances. This is more than a transaction.' },
  { id: 'protective', label: '🛡️ Check In & Feed', health: -10, trust: 12, attachment: 8, payment: 250, desc: 'Ask about their day. Make sure they ate. Feed gently. Walk them out safely.' }
];

const ACTIVITIES = [
  { id: 'coffee', label: '☕ Get Coffee Together', trust: 10, attachment: 5, desc: 'Talk about their life. Show you care beyond the feeding.' },
  { id: 'movie', label: '🎬 Watch Something', trust: 8, attachment: 10, desc: 'Quiet night in. Just being near each other.' },
  { id: 'walk', label: '🌙 Evening Walk', trust: 6, attachment: 8, desc: 'Fresh air. Conversation. No pressure.' },
  { id: 'cook', label: '🍳 Cook for Them', trust: 12, attachment: 12, desc: 'Make sure they\'re eating properly. You worry about them.' }
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

      await base44.entities.Donor.create({
        name,
        gender: Math.random() > 0.5 ? 'woman' : 'man',
        blood_type: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
        health: 100,
        willingness: 60 + Math.floor(Math.random() * 20),
        attachment: 0,
        trust: 30 + Math.floor(Math.random() * 20),
        arrangement: 'financial',
        frequency: 'weekly',
        boundaries: ['no-pain', 'safe-environment'],
        knows_truth: true,
        wants_to_be_turned: false,
        days_since_donation: 7,
        total_donations: 0
      });

      await base44.entities.NightLog.create({
        entry: `Crimson Connect Agency paired you with ${name}. They need the money. You'll take care of them.`,
        category: 'interaction',
        intensity: 'moderate'
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
        gentle: `You prepared everything carefully before ${donor.name} arrived. Made sure they were comfortable. Fed gently from their wrist. Checked on them after. "You okay?" you asked softly. They nodded, a small smile forming. "I'm okay. You're... different than I expected."`,
        scheduled: `${donor.name} arrived at the agreed time. Professional. Efficient. You followed Crimson Connect protocol. They left with their payment and a scheduled appointment for next week. Clean. Simple. Safe.`,
        intimate: `${donor.name} sat close to you. No rush. You brushed hair from their neck. "I've got you," you whispered. The feeding was slow. Tender. Their fingers found yours and held tight. When you pulled back, neither of you moved away.`,
        protective: `"How was your day?" you asked ${donor.name} when they arrived. They talked while you prepared everything. You made sure they'd eaten. Fed carefully. Walked them to their car after. "Text me when you get home," you said. They looked surprised. "You care?" "Of course I do."`
      };

      setOutcome(outcomes[style]);

      await base44.entities.NightLog.create({
        entry: `Fed from ${donor.name} (${feedStyle.label}). Paid $${feedStyle.payment}. Trust: ${newTrust}. Attachment: ${newAttachment}.`,
        category: 'feeding',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setFeeding(false);
        setOutcome('');
        setSelectedDonor(null);
      }, 5000);
    }, 2000);
  };

  const doActivity = async (donor, activity) => {
    const act = ACTIVITIES.find(a => a.id === activity);
    
    const newTrust = Math.min(100, donor.trust + act.trust);
    const newAttachment = Math.min(100, donor.attachment + act.attachment);

    await base44.entities.Donor.update(donor.id, {
      trust: newTrust,
      attachment: newAttachment
    });

    const outcomes = {
      coffee: `You met ${donor.name} at a café. No feeding scheduled. Just... talking. They told you about their struggles. Why they signed up with Crimson Connect. You listened. Really listened. When you paid for their coffee and groceries, they teared up. "You don't have to—" "I want to," you said.`,
      movie: `${donor.name} came over. You'd set up the living room. Blankets. Snacks for them. A movie neither of you really watched. They fell asleep against your shoulder. You stayed perfectly still, not wanting to wake them. Protecting them, even from discomfort.`,
      walk: `You walked with ${donor.name} through the quiet streets. They felt safe with you. Started opening up about their fears. Their dreams. "I never thought a vampire would care," they admitted. You stopped walking. "I do care. More than I should, maybe."`,
      cook: `You made ${donor.name} dinner. Real food. Protein. Vegetables. You couldn't eat it, but watching them enjoy it was enough. "You need to take care of yourself," you said. "Between donations, eat well. Rest." They looked at you with something like wonder. "Why do you care so much?" You didn't have an answer.`
    };

    setOutcome(outcomes[activity]);

    await base44.entities.NightLog.create({
      entry: `Spent time with ${donor.name}: ${act.label}. Building trust beyond the arrangement.`,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries(['donors']);

    setTimeout(() => {
      setOutcome('');
    }, 5000);
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
                Crimson Connect Donors
              </h2>
              <p className="text-gray-400 text-sm">Agency-paired feeding arrangements • Paid & protected</p>
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
                {finding ? 'Crimson Connect is finding a match...' : '+ Request New Donor from Crimson Connect'}
              </button>

              {donors.length === 0 ? (
                <div className="text-center py-12">
                  <Droplets className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No donors yet.</p>
                  <p className="text-gray-500 text-sm">Crimson Connect will pair you with someone who needs the money.</p>
                  <p className="text-gray-500 text-sm">You'll take care of them. They'll trust you.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {donors.map(donor => {
                    return (
                      <button
                        key={donor.id}
                        onClick={() => setSelectedDonor(donor)}
                        className="w-full bg-gray-800/50 hover:bg-gray-800 border border-red-900/30 rounded-xl p-4 text-left transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-white font-bold">{donor.name}</h3>
                            <p className="text-gray-400 text-sm">{donor.blood_type} • Crimson Connect Client • {donor.frequency} schedule</p>
                          </div>
                          <span className="text-2xl">💰</span>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                          <div>
                            <p className="text-gray-500">Health</p>
                            <p className="text-white font-medium">{donor.health}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Trust</p>
                            <p className="text-white font-medium">{donor.trust}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Bond</p>
                            <p className="text-white font-medium">{donor.attachment}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Feedings</p>
                            <p className="text-white font-medium">{donor.total_donations}</p>
                          </div>
                        </div>

                        {donor.attachment > 60 && (
                          <p className="text-pink-400 text-xs">💕 They're getting attached to you</p>
                        )}
                        {donor.total_donations > 0 && donor.days_since_donation < 7 && (
                          <p className="text-yellow-400 text-xs">⚠️ Too soon since last feeding - let them recover</p>
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
                <p className="text-gray-400 mb-4">
                  Crimson Connect Client • Needs the money • You're responsible for their wellbeing
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

              <h4 className="text-white font-medium mb-3">Scheduled Feeding</h4>
              <div className="grid grid-cols-1 gap-2 mb-6">
                {FEEDING_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => feedFromDonor(selectedDonor, style.id)}
                    disabled={(selectedDonor.total_donations > 0 && selectedDonor.days_since_donation < 7) || selectedDonor.health < 30}
                    className="bg-gray-800/50 hover:bg-gray-700 disabled:bg-gray-900/50 border border-red-900/30 rounded-lg p-3 text-left disabled:opacity-50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-white font-medium">{style.label}</p>
                      {style.payment > 0 && (
                        <span className="text-green-400 text-sm">${style.payment}</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs">{style.desc}</p>
                  </button>
                ))}
              </div>

              <h4 className="text-white font-medium mb-3">Beyond Feeding</h4>
              <div className="grid grid-cols-1 gap-2">
                {ACTIVITIES.map(activity => (
                  <button
                    key={activity.id}
                    onClick={() => doActivity(selectedDonor, activity.id)}
                    className="bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg p-3 text-left transition-all"
                  >
                    <p className="text-white font-medium">{activity.label}</p>
                    <p className="text-gray-400 text-xs">{activity.desc}</p>
                  </button>
                ))}
              </div>
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