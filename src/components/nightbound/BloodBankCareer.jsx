import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplet, AlertTriangle, DollarSign, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function BloodBankCareer({ human, onClose }) {
  const [shift, setShift] = useState(null);
  const [working, setWorking] = useState(false);
  const [vampireEvent, setVampireEvent] = useState(null);
  const queryClient = useQueryClient();

  const { data: vampires = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const vampire = vampires[0];

  const workShift = async () => {
    setWorking(true);

    const events = [
      { type: 'normal', desc: 'Sorted blood bags. Routine day at the blood bank.', pay: 80, awareness: 0, danger: 0 },
      { type: 'normal', desc: 'Checked inventory. Everything normal.', pay: 90, awareness: 0, danger: 0 },
      { type: 'notice', desc: 'Strange person came in asking unusual questions about blood storage...', pay: 85, awareness: 10, danger: 5 },
      { type: 'theft', desc: 'Blood bags went missing during your shift. Security is investigating.', pay: 100, awareness: 15, danger: 10 },
      { type: 'vampire', desc: 'You saw them. Taking blood. Their eyes... RED. They saw you too.', pay: 120, awareness: 30, danger: 40, vampire: true }
    ];

    const event = vampire && Math.random() > 0.7 
      ? events.find(e => e.vampire)
      : events[Math.floor(Math.random() * events.length)];

    setShift(event);

    await base44.entities.Human.update(human.id, {
      awareness_level: Math.min(100, (human.awareness_level || 0) + event.awareness),
      danger_level: Math.min(100, (human.danger_level || 0) + event.danger)
    });

    await base44.entities.NightLog.create({
      entry: `${human.name} worked at the blood bank: ${event.desc}`,
      category: 'interaction',
      intensity: event.vampire ? 'significant' : 'moderate'
    });

    if (event.vampire) {
      setVampireEvent(vampire);
      await base44.entities.Human.update(human.id, {
        vampire_encounters: (human.vampire_encounters || 0) + 1
      });
    }

    queryClient.invalidateQueries();
    setTimeout(() => setWorking(false), 500);
  };

  const vampireApproaches = async (choice) => {
    if (choice === 'run') {
      await base44.entities.Human.update(human.id, {
        danger_level: Math.min(100, (human.danger_level || 0) + 20),
        awareness_level: Math.min(100, (human.awareness_level || 0) + 20)
      });
      await base44.entities.NightLog.create({
        entry: `${human.name} RAN from ${vampire.vampire_name} at the blood bank. They're terrified.`,
        category: 'interaction',
        intensity: 'significant'
      });
    } else if (choice === 'confront') {
      await base44.entities.Human.update(human.id, {
        awareness_level: 100,
        danger_level: Math.min(100, (human.danger_level || 0) + 30),
        obsession_level: Math.min(100, (human.obsession_level || 0) + 15)
      });
      await base44.entities.NightLog.create({
        entry: `${human.name} confronted ${vampire.vampire_name}: "I know what you are..." The vampire smiled.`,
        category: 'interaction',
        intensity: 'significant'
      });
    } else if (choice === 'help') {
      await base44.entities.Human.update(human.id, {
        awareness_level: 100,
        danger_level: Math.max(0, (human.danger_level || 0) - 10),
        obsession_level: Math.min(100, (human.obsession_level || 0) + 25)
      });
      await base44.entities.NightLog.create({
        entry: `${human.name} offered to help ${vampire.vampire_name} get blood safely. A dangerous alliance forms...`,
        category: 'interaction',
        intensity: 'significant'
      });
    }

    queryClient.invalidateQueries();
    setVampireEvent(null);
    onClose();
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
        className="bg-gradient-to-br from-red-900/30 to-gray-900/30 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-red-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Droplet className="w-8 h-8 text-red-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Blood Bank Worker</h2>
              <p className="text-gray-400 text-sm">Night shift • Access to blood</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {vampireEvent ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-red-950/60 border-2 border-red-500/50 rounded-xl p-6">
                <Eye className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-white text-xl font-bold text-center mb-3">
                  YOU SAW A VAMPIRE
                </h3>
                <p className="text-red-300 text-center mb-4">
                  {vampireEvent.vampire_name} was taking blood from the storage. 
                  Your eyes met. They know you saw them. What do you do?
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => vampireApproaches('run')}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl"
                >
                  🏃 Run and report this
                </button>
                <button
                  onClick={() => vampireApproaches('confront')}
                  className="w-full bg-orange-700 hover:bg-orange-600 text-white py-3 rounded-xl"
                >
                  😠 Confront them
                </button>
                <button
                  onClick={() => vampireApproaches('help')}
                  className="w-full bg-purple-700 hover:bg-purple-600 text-white py-3 rounded-xl"
                >
                  🤝 Offer to help them
                </button>
              </div>
            </motion.div>
          ) : shift ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className={`rounded-xl p-4 border-2 ${
                shift.type === 'vampire' ? 'bg-red-950/40 border-red-500/50' :
                shift.type === 'theft' ? 'bg-orange-950/40 border-orange-500/50' :
                shift.type === 'notice' ? 'bg-yellow-950/40 border-yellow-500/50' :
                'bg-gray-800/50 border-gray-700'
              }`}>
                {shift.vampire && <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />}
                <p className="text-white text-center">{shift.desc}</p>
              </div>

              <div className="bg-green-950/40 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <p className="text-white font-bold">Earned: ${shift.pay}</p>
                </div>
              </div>

              {(shift.awareness > 0 || shift.danger > 0) && (
                <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3">
                  <p className="text-red-300 text-sm text-center">
                    {shift.awareness > 0 && `+${shift.awareness}% Awareness • `}
                    {shift.danger > 0 && `+${shift.danger}% Danger`}
                  </p>
                </div>
              )}

              <button
                onClick={() => setShift(null)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl"
              >
                Finish Shift
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">⚠️ High Risk Job</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Working at a blood bank... you have access to what vampires crave most.
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-400">💰 Pay: $80-120 per shift</p>
                  <p className="text-yellow-400">⚠️ Risk: May encounter vampires</p>
                  <p className="text-red-400">🩸 Access: Blood storage</p>
                </div>
              </div>

              {vampire && (
                <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
                  <p className="text-purple-300 text-sm text-center">
                    🦇 A vampire exists in this town. They need blood...
                  </p>
                </div>
              )}

              <button
                onClick={workShift}
                disabled={working}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-700 disabled:to-gray-700 text-white py-4 rounded-xl font-bold"
              >
                {working ? 'Working...' : '🩸 Work Night Shift'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}