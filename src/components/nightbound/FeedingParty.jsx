import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Wine, Moon, Heart, Skull } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function FeedingParty({ vampireState, onClose }) {
  const [planning, setPlanning] = useState(true);
  const [guestList, setGuestList] = useState([]);
  const [partyType, setPartyType] = useState('intimate');
  const [inProgress, setInProgress] = useState(false);
  const queryClient = useQueryClient();

  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });

  const { data: humans = [] } = useQuery({
    queryKey: ['humans'],
    queryFn: () => base44.entities.Human.list()
  });

  const partyTypes = [
    { id: 'intimate', name: 'Intimate Gathering', guests: '3-5', vibe: 'Exclusive, sensual', danger: 15 },
    { id: 'cocktail', name: 'Cocktail Party', guests: '8-12', vibe: 'Sophisticated, elegant', danger: 25 },
    { id: 'rave', name: 'Blood Rave', guests: '20+', vibe: 'Wild, chaotic', danger: 50 },
    { id: 'masquerade', name: 'Masquerade Ball', guests: '15-20', vibe: 'Mysterious, theatrical', danger: 30 }
  ];

  const availableGuests = [
    ...servants.map(s => ({ ...s, type: 'servant', knows: true })),
    ...humans.map(h => ({ ...h, type: 'human', knows: h.awareness_level > 30 }))
  ];

  const toggleGuest = (guest) => {
    if (guestList.find(g => g.id === guest.id)) {
      setGuestList(guestList.filter(g => g.id !== guest.id));
    } else {
      setGuestList([...guestList, guest]);
    }
  };

  const hostParty = async () => {
    setInProgress(true);
    setPlanning(false);

    const selectedType = partyTypes.find(t => t.id === partyType);
    
    let narrative = `🍷 You host a ${selectedType.name}.\n\n`;
    
    if (guestList.length === 0) {
      narrative += `You invited strangers. Fresh blood. Unknowing prey.\n\n`;
    } else {
      narrative += `Guest list:\n`;
      guestList.forEach(g => {
        narrative += `• ${g.name} (${g.type})\n`;
      });
      narrative += `\n`;
    }

    const scenes = [];

    if (partyType === 'intimate') {
      scenes.push(
        `The lights are dim. Music soft. Wine flows.\n\nEveryone relaxed. Comfortable. Perfect.`,
        `You circulate. Charming. Magnetic.\n\nEyes follow you. They don't know why.\n\nBut they're drawn to you.`,
        `Bite marks hidden by collars. Lipstick. Shadows.\n\nNo one notices. Or maybe they don't care.`,
        `${servants[0]?.name || 'Your servant'} brings someone to you.\n\n"They want to meet you," they whisper.\n\nYou smile. Of course they do.`
      );
    } else if (partyType === 'cocktail') {
      scenes.push(
        `The party is elegant. Sophisticated.\n\nChampagne. Canapés. Conversation.\n\nAnd underneath it all... hunger.`,
        `You take someone to a quiet room.\n\n"Just between us," you say.\n\nThey agree. They always agree.`,
        `Your servants work the crowd.\n\nBringing the willing. The curious.\n\nOne by one. Discreetly.`,
        `By midnight, you've fed three times.\n\nNo one suspects. Everyone's having fun.\n\nPerfect cover.`
      );
    } else if (partyType === 'rave') {
      scenes.push(
        `The bass pounds. Lights strobe. Bodies press together.\n\nChaos. Perfect chaos.`,
        `You feed in dark corners. On the dance floor.\n\nNo one notices. Too drunk. Too high.\n\nToo lost in the music.`,
        `Blood and sweat mix. The crowd throbs.\n\nYou're a predator in paradise.\n\nFeeding freely.`,
        `Someone collapses. Too much "fun."\n\nParamedics called. You're already gone.\n\nAnother successful hunt.`
      );
    } else if (partyType === 'masquerade') {
      scenes.push(
        `Masks hide everything. Identity. Intent.\n\nPerfect for secrets.`,
        `You dance with strangers.\n\nLead them to balconies. Empty rooms.\n\nFeed under moonlight.`,
        `The masks make it a game.\n\nWho's prey? Who's predator?\n\nOnly you know for sure.`,
        `Your servants wear matching masks.\n\nHelping. Hunting. Together.\n\nA coordinated feast.`
      );
    }

    narrative += `\n${scenes.join('\n\n')}\n\n`;

    // Calculate gains
    const hungerReduction = guestList.length > 0 ? 40 : 30;
    const powerGain = Math.floor(Math.random() * 10) + 5;
    const exposureRisk = selectedType.danger + (guestList.filter(g => !g.knows).length * 5);

    // Relationship changes for servants
    for (const guest of guestList.filter(g => g.type === 'servant')) {
      await base44.entities.Servant.update(guest.id, {
        relationship: Math.min(100, (guest.relationship || 0) + 15)
      });
    }

    // Awareness changes for humans
    for (const guest of guestList.filter(g => g.type === 'human')) {
      await base44.entities.Human.update(guest.id, {
        awareness_level: Math.min(100, (guest.awareness_level || 0) + Math.floor(Math.random() * 20) + 10),
        danger_level: Math.min(100, (guest.danger_level || 0) + Math.floor(Math.random() * 15) + 5),
        vampire_encounters: (guest.vampire_encounters || 0) + 1
      });
    }

    await base44.entities.VampireState.update(vampireState.id, {
      hunger_state: 'sated',
      vampire_power_level: Math.min(100, (vampireState.vampire_power_level || 0) + powerGain),
      exposure_level: Math.min(100, (vampireState.exposure_level || 0) + Math.floor(exposureRisk / 2))
    });

    await base44.entities.NightLog.create({
      entry: `${vampireState.vampire_name} hosted a ${selectedType.name} - fed multiple times, ${guestList.length} guests attended`,
      category: 'feeding',
      intensity: 'significant'
    });

    narrative += `\n✨ Results:\n`;
    narrative += `• Hunger: Sated\n`;
    narrative += `• Power: +${powerGain}\n`;
    narrative += `• Exposure Risk: +${Math.floor(exposureRisk / 2)}\n`;
    if (guestList.filter(g => g.type === 'servant').length > 0) {
      narrative += `• Servants bonded through shared experience\n`;
    }

    queryClient.invalidateQueries();
    alert(narrative);
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
        className="bg-gradient-to-br from-red-900/30 to-purple-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-red-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Wine className="w-8 h-8 text-red-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Feeding Party</h2>
              <p className="text-gray-400 text-sm">Host a gathering. Feed with style.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {planning ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-white font-bold mb-3">Party Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {partyTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setPartyType(type.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        partyType === type.id
                          ? 'bg-red-600 border-red-500'
                          : 'bg-gray-800 border-gray-700 hover:border-red-500/50'
                      }`}
                    >
                      <h4 className="text-white font-bold mb-1">{type.name}</h4>
                      <p className="text-gray-400 text-xs mb-2">{type.guests} guests</p>
                      <p className="text-gray-300 text-xs mb-2">{type.vibe}</p>
                      <p className={`text-xs font-bold ${
                        type.danger > 40 ? 'text-red-400' :
                        type.danger > 25 ? 'text-orange-400' :
                        'text-yellow-400'
                      }`}>
                        Risk: {type.danger}%
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-bold mb-3">Guest List (Optional)</h3>
                <p className="text-gray-400 text-sm mb-3">Select specific people to invite, or leave empty to invite strangers</p>
                
                {availableGuests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No one to invite yet</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availableGuests.map(guest => (
                      <button
                        key={`${guest.type}-${guest.id}`}
                        onClick={() => toggleGuest(guest)}
                        className={`w-full p-3 rounded-xl border transition-all ${
                          guestList.find(g => g.id === guest.id)
                            ? 'bg-purple-600 border-purple-500'
                            : 'bg-gray-800 border-gray-700 hover:border-purple-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <p className="text-white font-medium">{guest.name}</p>
                            <p className="text-gray-400 text-xs capitalize">
                              {guest.type} • {guest.knows ? 'Knows your secret' : 'Unaware'}
                            </p>
                          </div>
                          {guest.type === 'servant' ? (
                            <Users className="w-5 h-5 text-purple-400" />
                          ) : (
                            <Heart className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-yellow-950/40 border border-yellow-500/30 rounded-xl p-4">
                <h4 className="text-yellow-300 font-bold mb-2">⚠️ Party Planning</h4>
                <div className="space-y-1 text-sm text-gray-300">
                  <p>• Larger parties = more feeding opportunities</p>
                  <p>• Higher risk = more exposure</p>
                  <p>• Servants help maintain cover</p>
                  <p>• Unaware humans increase danger</p>
                </div>
              </div>

              <button
                onClick={hostParty}
                className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Wine className="w-5 h-5" />
                Host Party
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}