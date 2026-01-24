import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Target, Heart, Sword, MessageCircle, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function HunterEncounter({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [encounterStage, setEncounterStage] = useState('searching'); // searching, encounter, choice, outcome
  const [hunter, setHunter] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [processing, setProcessing] = useState(false);

  const { data: hunters = [] } = useQuery({
    queryKey: ['hunters'],
    queryFn: () => base44.entities.Hunter.list()
  });

  React.useEffect(() => {
    if (encounterStage === 'searching') {
      setProcessing(true);
      setTimeout(() => {
        const encounterChance = Math.random();
        
        if (encounterChance < 0.6) {
          // Generate or use existing hunter
          if (hunters.length > 0 && Math.random() < 0.5) {
            setHunter(hunters[Math.floor(Math.random() * hunters.length)]);
          } else {
            const names = ['Sarah Cross', 'Marcus Blade', 'Isabella Hunt', 'Victor Kane', 'Rachel Ashford', 'Thomas Grey'];
            const specialties = ['tracker', 'researcher', 'combatant', 'infiltrator'];
            const randomName = names[Math.floor(Math.random() * names.length)];
            const randomSpecialty = specialties[Math.floor(Math.random() * specialties.length)];
            
            setHunter({
              name: randomName,
              specialty: randomSpecialty,
              isNew: true,
              skill_level: Math.floor(Math.random() * 30) + 40,
              suspicion: Math.floor(Math.random() * 40) + 20
            });
          }
          setEncounterStage('encounter');
        } else {
          setOutcome('You walked the streets. No encounters tonight. Peaceful.');
          setEncounterStage('outcome');
          setTimeout(() => onClose(), 3000);
        }
        setProcessing(false);
      }, 2000);
    }
  }, [encounterStage, hunters]);

  const handleChoice = async (choice) => {
    setProcessing(true);
    setEncounterStage('outcome');

    setTimeout(async () => {
      try {
        let outcomeText = '';
        let intensity = 'moderate';

        if (choice === 'hostile') {
          const hostileOutcomes = [
            `Fight broke out. You fled. ${hunter.name} saw your face. They'll remember.`,
            `Confrontation escalated. ${hunter.name} drew weapons. You barely escaped. Exposed.`,
            `${hunter.name} attacked. Quick violence. You fought back. They're wounded but alive. Dangerous now.`,
            `Hostile encounter. ${hunter.name} swore to hunt you down. Made an enemy tonight.`
          ];
          outcomeText = hostileOutcomes[Math.floor(Math.random() * hostileOutcomes.length)];
          
          if (hunter.isNew) {
            await base44.entities.Hunter.create({
              name: hunter.name,
              specialty: hunter.specialty,
              skill_level: hunter.skill_level,
              suspicion: Math.min(hunter.suspicion + 30, 100),
              status: 'tracking'
            });
          } else {
            await base44.entities.Hunter.update(hunter.id, {
              suspicion: Math.min((hunter.suspicion || 0) + 30, 100),
              status: 'tracking'
            });
          }

          if (vampireState?.id) {
            await base44.entities.VampireState.update(vampireState.id, {
              exposure_level: Math.min((vampireState.exposure_level || 0) + 15, 100)
            });
          }
          intensity = 'significant';
        } else if (choice === 'flirt') {
          const flirtOutcomes = [
            `You flirted with ${hunter.name}. Dangerous game. They're intrigued. Maybe attracted. Maybe suspicious.`,
            `Sexual tension. ${hunter.name} couldn't look away. Hunter. Vampire. Forbidden attraction sparked.`,
            `You got close to ${hunter.name}. Whispered. Touched. They didn't pull away. Chemistry undeniable.`,
            `Flirtation successful. ${hunter.name} is confused now. Professional hunter. Attracted to their prey. Dangerous.`
          ];
          outcomeText = flirtOutcomes[Math.floor(Math.random() * flirtOutcomes.length)];
          
          if (hunter.isNew) {
            const created = await base44.entities.Hunter.create({
              name: hunter.name,
              specialty: hunter.specialty,
              skill_level: hunter.skill_level,
              suspicion: Math.max(hunter.suspicion - 10, 0),
              status: 'conflicted'
            });
            hunter.id = created.id;
          } else {
            await base44.entities.Hunter.update(hunter.id, {
              suspicion: Math.max((hunter.suspicion || 0) - 10, 0),
              status: 'conflicted'
            });
          }

          await base44.entities.SupernaturalDate.create({
            vampire_id: vampireState.id,
            date_name: hunter.name,
            date_type: 'hunter',
            gender: 'custom',
            personality: ['conflicted', 'dangerous', 'attractive'],
            relationship_level: 20,
            tension_level: 60,
            dangerous_attraction: true
          });
        } else if (choice === 'seduce') {
          const seduceOutcomes = [
            `You seduced ${hunter.name} completely. Took them somewhere private. Hunter and vampire. Bodies entwined. Dangerous sex. They're yours now.`,
            `Sexual tension exploded. ${hunter.name} couldn't resist. You fucked in an alley. Fast. Desperate. Hunter moaning your name. Conflicted.`,
            `You pulled ${hunter.name} into the shadows. Kissed them hard. They kissed back. Clothes off. Public space. Risk made it better. They're addicted now.`,
            `Seduction successful. ${hunter.name} is your lover now. Enemy. Partner. Both. They'll protect you. Maybe.`
          ];
          outcomeText = seduceOutcomes[Math.floor(Math.random() * seduceOutcomes.length)];
          
          if (hunter.isNew) {
            const created = await base44.entities.Hunter.create({
              name: hunter.name,
              specialty: hunter.specialty,
              skill_level: hunter.skill_level,
              suspicion: 0,
              status: 'recruited'
            });
            hunter.id = created.id;
          } else {
            await base44.entities.Hunter.update(hunter.id, {
              suspicion: 0,
              status: 'recruited'
            });
          }

          await base44.entities.SupernaturalDate.create({
            vampire_id: vampireState.id,
            date_name: hunter.name,
            date_type: 'hunter',
            gender: 'custom',
            personality: ['seduced', 'conflicted', 'passionate'],
            relationship_level: 60,
            intimacy_level: 80,
            tension_level: 40,
            dangerous_attraction: true,
            relationship_status: 'secret'
          });
          intensity = 'significant';
        } else if (choice === 'talk') {
          const talkOutcomes = [
            `You talked with ${hunter.name}. Honest conversation. They're questioning everything now. Maybe humans and vampires aren't so different.`,
            `Civil discussion. ${hunter.name} listened. You explained your side. They're conflicted. Hunting you feels wrong now.`,
            `You shared your story. ${hunter.name} didn't attack. They're thinking. Maybe peace is possible.`,
            `Conversation changed ${hunter.name}'s perspective. Hunter. Monster. Labels blur. Understanding growing.`
          ];
          outcomeText = talkOutcomes[Math.floor(Math.random() * talkOutcomes.length)];
          
          if (hunter.isNew) {
            await base44.entities.Hunter.create({
              name: hunter.name,
              specialty: hunter.specialty,
              skill_level: hunter.skill_level,
              suspicion: Math.max(hunter.suspicion - 20, 0),
              status: 'conflicted'
            });
          } else {
            await base44.entities.Hunter.update(hunter.id, {
              suspicion: Math.max((hunter.suspicion || 0) - 20, 0),
              status: 'conflicted'
            });
          }
        } else if (choice === 'evade') {
          const evadeOutcomes = [
            `You vanished before ${hunter.name} could react. They saw nothing. Clean escape.`,
            `Slipped away into shadows. ${hunter.name} looked confused. No confrontation. Safe.`,
            `You left before ${hunter.name} noticed you. Avoided encounter. Smart.`
          ];
          outcomeText = evadeOutcomes[Math.floor(Math.random() * evadeOutcomes.length)];
        }

        setOutcome(outcomeText);

        await base44.entities.NightLog.create({
          entry: `Random encounter: ${outcomeText}`,
          category: 'interaction',
          intensity: intensity
        });

        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Encounter failed:', e);
        setOutcome('Something went wrong...');
      }

      setProcessing(false);
      setTimeout(() => onClose(), 5000);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4">Night Walk</h2>

        {processing || encounterStage === 'searching' ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              Walking the streets...
            </motion.p>
          </div>
        ) : encounterStage === 'encounter' && hunter ? (
          <div>
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-300 text-sm mb-2">⚠️ Hunter Encountered</p>
              <h3 className="text-white font-bold text-lg">{hunter.name}</h3>
              <p className="text-gray-400 text-sm capitalize">{hunter.specialty}</p>
            </div>

            <p className="text-gray-300 text-sm mb-6">
              You turned a corner and there they were. Hunter. Armed. Watching. How do you respond?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleChoice('hostile')}
                className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl p-3 text-left transition-colors"
              >
                <Sword className="w-5 h-5 text-red-400 mb-1" />
                <h4 className="text-white font-medium">Hostile</h4>
                <p className="text-gray-400 text-xs">Confront them. Violence. Bad vibes.</p>
              </button>

              <button
                onClick={() => handleChoice('flirt')}
                className="w-full bg-pink-900/40 hover:bg-pink-900/60 border border-pink-500/30 rounded-xl p-3 text-left transition-colors"
              >
                <Heart className="w-5 h-5 text-pink-400 mb-1" />
                <h4 className="text-white font-medium">Flirt</h4>
                <p className="text-gray-400 text-xs">Dangerous attraction. Test the chemistry.</p>
              </button>

              <button
                onClick={() => handleChoice('seduce')}
                className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-3 text-left transition-colors"
              >
                <Heart className="w-5 h-5 text-purple-400 mb-1" />
                <h4 className="text-white font-medium">Seduce Fully</h4>
                <p className="text-gray-400 text-xs">Take them. Now. Sexual. Risky. Powerful.</p>
              </button>

              <button
                onClick={() => handleChoice('talk')}
                className="w-full bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 rounded-xl p-3 text-left transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-blue-400 mb-1" />
                <h4 className="text-white font-medium">Talk Peacefully</h4>
                <p className="text-gray-400 text-xs">Civil conversation. Understanding. Good vibes.</p>
              </button>

              <button
                onClick={() => handleChoice('evade')}
                className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-3 text-left transition-colors"
              >
                <Eye className="w-5 h-5 text-gray-400 mb-1" />
                <h4 className="text-white font-medium">Evade</h4>
                <p className="text-gray-400 text-xs">Disappear. Avoid entirely. Safe.</p>
              </button>
            </div>
          </div>
        ) : encounterStage === 'outcome' ? (
          <div className="text-center py-8">
            <p className="text-gray-300 leading-relaxed">{outcome}</p>
          </div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}