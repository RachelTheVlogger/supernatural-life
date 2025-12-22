import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const LOCATION_VISUALS = {
  'Night walk through the city': {
    bg: 'linear-gradient(to bottom, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)',
    emoji: '🌃',
    narrative: [
      'The city at night belongs to you.',
      'Streetlights cast pools of amber on empty sidewalks. Steam rises from grates. Somewhere, a siren wails and fades.',
      'You walk together through the sleeping world. Your companion stays close, drawn to the way you move through darkness like you own it.',
      'A drunk stumbles past, never seeing you. A cat watches from an alley, knowing. The night has a pulse you both feel.',
      'Their breath fogs the air. Yours does not. They notice but say nothing.',
      'Time moves differently here, between the streetlights and shadows. Hours could be minutes. Minutes could be eternity.'
    ]
  },
  'Visit an abandoned building': {
    bg: 'linear-gradient(to bottom, #0d0d0d 0%, #1a1a1a 50%, #262626 100%)',
    emoji: '🏚️',
    narrative: [
      'The building has been forgotten by everyone except the night.',
      'Broken windows gape like missing teeth. Moonlight spills across floors thick with dust and memory.',
      'You lead them through rooms that haven\'t held breath in years. Graffiti marks the walls - territorial claims that mean nothing now.',
      'Their hand finds yours in the darkness. Not from fear. From something else.',
      'You show them how silence has weight. How abandonment leaves traces. How some places remember what happened in them.',
      'When you finally speak, your voice echoes through empty halls. They shiver, but don\'t let go of your hand.'
    ]
  },
  'Go to a rooftop': {
    bg: 'linear-gradient(to bottom, #000428 0%, #004e92 50%, #1a1a2e 100%)',
    emoji: '🌆',
    narrative: [
      'The city spreads below like a living map of light and shadow.',
      'Up here, the wind has teeth. It pulls at clothes, hair, the last warmth in mortal skin.',
      'You stand at the edge. They stand beside you, trusting you completely. The drop is nothing to you. To them, it\'s everything.',
      'You point out territories. Streets you\'ve walked. Windows you\'ve watched. A whole secret geography only the night knows.',
      'They lean against you, seeking shelter from the wind. Or maybe from the vast emptiness between rooftop and stars.',
      'You could stay here until dawn, but you don\'t. There are other nights. Other rooftops. Time is the one thing you have.'
    ]
  },
  'Walk through the forest': {
    bg: 'linear-gradient(to bottom, #0a1f0a 0%, #1a331a 50%, #0d260d 100%)',
    emoji: '🌲',
    narrative: [
      'The forest breathes differently than the city.',
      'Ancient trees stand like sentinels, their branches weaving darkness overhead. Moonlight barely touches the forest floor.',
      'Your feet make no sound on the carpet of pine needles and moss. Theirs do - small reminders of mortality, of warmth, of a beating heart.',
      'Something moves in the undergrowth. Eyes gleam and vanish. The forest is watching, curious about this strange pairing.',
      'You show them how to move through darkness, how to read the night. They\'re learning. Becoming something different with each step.',
      'When an owl calls, they startle. You don\'t. You\'ve heard that call for longer than they\'ve been alive.'
    ]
  },
  'Visit a cemetery': {
    bg: 'linear-gradient(to bottom, #0a0a14 0%, #1a1a2e 50%, #0f0f1f 100%)',
    emoji: '⚰️',
    narrative: [
      'Death has no weight here. Not for you.',
      'Stone angels keep their vigil, weather-worn faces watching nothing. Mist curls between gravestones like seeking fingers.',
      'You walk paths you\'ve walked before, past names you might have known. Time has different meaning here, where endings are marked in marble.',
      'They read inscriptions aloud - beloved, remembered, gone too soon. The words mean different things to you now.',
      'You tell them that death isn\'t the end they think it is. That some things persist. That memory has its own kind of eternity.',
      'They look at you differently after that. Understanding starting to dawn, terrible and inevitable as sunrise.'
    ]
  }
};

export default function LocationVisit({ location, servantName, outcome, onClose }) {
  const [narrativeIndex, setNarrativeIndex] = useState(0);
  const visual = LOCATION_VISUALS[location.name];
  
  useEffect(() => {
    if (narrativeIndex < visual.narrative.length - 1) {
      const timer = setTimeout(() => {
        setNarrativeIndex(narrativeIndex + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [narrativeIndex, visual.narrative.length]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: visual.bg }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 left-4 text-white/60 hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      
      <div className="max-w-3xl w-full px-4">
        {/* Location emoji */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-8xl mb-6 text-center"
        >
          {visual.emoji}
        </motion.div>
        
        {/* Location name */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white mb-8 text-center"
        >
          {location.name}
        </motion.h2>
        
        {/* Narrative paragraphs */}
        <div className="space-y-6 mb-8">
          {visual.narrative.slice(0, narrativeIndex + 1).map((text, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-gray-200 text-base leading-relaxed text-center max-w-2xl mx-auto"
            >
              {text}
            </motion.p>
          ))}
        </div>
        
        {/* Servant name tag */}
        {narrativeIndex >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-purple-400 text-sm">
              With {servantName}
            </p>
          </motion.div>
        )}
        
        {/* Continue button after all narrative shown */}
        {narrativeIndex === visual.narrative.length - 1 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            onClick={onClose}
            className="mt-8 mx-auto block bitlife-btn px-8 py-3 rounded-xl"
          >
            Continue
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}