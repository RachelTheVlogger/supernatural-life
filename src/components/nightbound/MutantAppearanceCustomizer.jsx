import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Sparkles } from 'lucide-react';
import { MutantAnimationWrapper } from './MutantAnimations';

const APPEARANCE_OPTIONS = {
  skin_tone: [
    { value: 'pale', label: 'Pale', color: 'bg-amber-100' },
    { value: 'fair', label: 'Fair', color: 'bg-yellow-100' },
    { value: 'medium', label: 'Medium', color: 'bg-amber-200' },
    { value: 'tan', label: 'Tan', color: 'bg-amber-600' },
    { value: 'dark', label: 'Dark', color: 'bg-amber-900' },
    { value: 'ebony', label: 'Ebony', color: 'bg-black' },
    { value: 'iridescent', label: 'Iridescent', color: 'bg-gradient-to-r from-purple-400 to-cyan-400' },
    { value: 'luminous', label: 'Luminous', color: 'bg-yellow-200 shadow-lg shadow-yellow-300' },
    { value: 'crystalline', label: 'Crystalline', color: 'bg-cyan-100 opacity-70' },
    { value: 'shadow', label: 'Shadow', color: 'bg-purple-950' }
  ],
  hair_color: [
    { value: 'black', label: 'Black', color: 'bg-gray-950' },
    { value: 'brown', label: 'Brown', color: 'bg-amber-800' },
    { value: 'blonde', label: 'Blonde', color: 'bg-yellow-400' },
    { value: 'red', label: 'Red', color: 'bg-red-600' },
    { value: 'white', label: 'White', color: 'bg-gray-100' },
    { value: 'silver', label: 'Silver', color: 'bg-gray-300' },
    { value: 'neon_blue', label: 'Neon Blue', color: 'bg-cyan-400 shadow-lg shadow-cyan-500' },
    { value: 'neon_purple', label: 'Neon Purple', color: 'bg-purple-500 shadow-lg shadow-purple-400' },
    { value: 'electric_green', label: 'Electric Green', color: 'bg-green-400 shadow-lg shadow-green-500' },
    { value: 'flame_orange', label: 'Flame Orange', color: 'bg-orange-500 shadow-lg shadow-orange-400' },
    { value: 'icy_white', label: 'Icy White', color: 'bg-blue-100 shadow-lg shadow-blue-300' },
    { value: 'void_black', label: 'Void Black', color: 'bg-gray-950 shadow-lg shadow-purple-900' }
  ],
  eye_color: [
    { value: 'brown', label: 'Brown', color: 'bg-amber-700' },
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'amber', label: 'Amber', color: 'bg-yellow-500' },
    { value: 'gray', label: 'Gray', color: 'bg-gray-400' },
    { value: 'red', label: 'Red', color: 'bg-red-600' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-600' },
    { value: 'silver', label: 'Silver', color: 'bg-gray-200 shadow-lg shadow-gray-400' },
    { value: 'golden', label: 'Golden', color: 'bg-yellow-400 shadow-lg shadow-yellow-300' },
    { value: 'pitch_black', label: 'Pitch Black', color: 'bg-black shadow-lg shadow-purple-950' },
    { value: 'glowing_cyan', label: 'Glowing Cyan', color: 'bg-cyan-300 shadow-lg shadow-cyan-400' },
    { value: 'molten_orange', label: 'Molten Orange', color: 'bg-orange-600 shadow-lg shadow-red-500' }
  ],
  mutation_markings: [
    { value: 'none', label: 'None' },
    { value: 'subtle_lines', label: 'Subtle Lines' },
    { value: 'glowing_patterns', label: 'Glowing Patterns' },
    { value: 'scaled', label: 'Scaled' },
    { value: 'crystalline_formations', label: 'Crystalline Formations' },
    { value: 'shadow_aura', label: 'Shadow Aura' },
    { value: 'light_trails', label: 'Light Trails' },
    { value: 'bio_phosphorescence', label: 'Bio-Phosphorescence' },
    { value: 'geometric_tattoos', label: 'Geometric Tattoos' },
    { value: 'cosmic_patterns', label: 'Cosmic Patterns' }
  ]
};

export default function MutantAppearanceCustomizer({ mutant, onUpdate }) {
  const [editingField, setEditingField] = React.useState(null);

  const handleUpdate = async (field, value) => {
    await onUpdate(field, value);
    setEditingField(null);
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 space-y-6">
      <h3 className="text-white font-bold flex items-center gap-2 text-lg">
        <Palette className="w-5 h-5 text-pink-400" />
        Appearance Customization
      </h3>

      {/* Preview */}
      <div className="flex justify-center py-6">
        <MutantAnimationWrapper mutantType={mutant?.mutant_type}>
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg ${
              APPEARANCE_OPTIONS.skin_tone.find(t => t.value === mutant?.skin_tone)?.color || 'bg-amber-200'
            }`}>
              <div className={`w-8 h-8 rounded-full ${
                APPEARANCE_OPTIONS.eye_color.find(e => e.value === mutant?.eye_color)?.color || 'bg-brown'
              }`} />
            </div>
            <p className="text-gray-400 text-xs uppercase tracking-widest">Preview</p>
          </div>
        </MutantAnimationWrapper>
      </div>

      {/* Customization Options */}
      <div className="space-y-4">
        {/* Skin Tone */}
        <div>
          <button
            onClick={() => setEditingField(editingField === 'skin_tone' ? null : 'skin_tone')}
            className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-white font-medium flex justify-between items-center"
          >
            Skin Tone
            <span className="text-xs text-gray-400">
              {APPEARANCE_OPTIONS.skin_tone.find(t => t.value === mutant?.skin_tone)?.label || 'Medium'}
            </span>
          </button>
          {editingField === 'skin_tone' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 grid grid-cols-5 gap-2"
            >
              {APPEARANCE_OPTIONS.skin_tone.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleUpdate('skin_tone', option.value)}
                  className={`h-10 rounded-lg border-2 transition-all ${
                    mutant?.skin_tone === option.value
                      ? 'border-white scale-110'
                      : 'border-transparent hover:border-gray-600'
                  } ${option.color}`}
                  title={option.label}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Hair Color */}
        <div>
          <button
            onClick={() => setEditingField(editingField === 'hair_color' ? null : 'hair_color')}
            className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-white font-medium flex justify-between items-center"
          >
            Hair Color
            <span className="text-xs text-gray-400">
              {APPEARANCE_OPTIONS.hair_color.find(h => h.value === mutant?.hair_color)?.label || 'Black'}
            </span>
          </button>
          {editingField === 'hair_color' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 grid grid-cols-6 gap-2"
            >
              {APPEARANCE_OPTIONS.hair_color.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleUpdate('hair_color', option.value)}
                  className={`h-10 rounded-lg border-2 transition-all ${
                    mutant?.hair_color === option.value
                      ? 'border-white scale-110'
                      : 'border-transparent hover:border-gray-600'
                  } ${option.color}`}
                  title={option.label}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Eye Color */}
        <div>
          <button
            onClick={() => setEditingField(editingField === 'eye_color' ? null : 'eye_color')}
            className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-white font-medium flex justify-between items-center"
          >
            Eye Color
            <span className="text-xs text-gray-400">
              {APPEARANCE_OPTIONS.eye_color.find(e => e.value === mutant?.eye_color)?.label || 'Brown'}
            </span>
          </button>
          {editingField === 'eye_color' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 grid grid-cols-6 gap-2"
            >
              {APPEARANCE_OPTIONS.eye_color.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleUpdate('eye_color', option.value)}
                  className={`h-10 rounded-lg border-2 transition-all ${
                    mutant?.eye_color === option.value
                      ? 'border-white scale-110'
                      : 'border-transparent hover:border-gray-600'
                  } ${option.color}`}
                  title={option.label}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Mutation Markings */}
        <div>
          <button
            onClick={() => setEditingField(editingField === 'mutation_markings' ? null : 'mutation_markings')}
            className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-white font-medium flex justify-between items-center"
          >
            Mutation Markings
            <span className="text-xs text-gray-400">
              {APPEARANCE_OPTIONS.mutation_markings.find(m => m.value === mutant?.mutation_markings)?.label || 'None'}
            </span>
          </button>
          {editingField === 'mutation_markings' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 grid grid-cols-2 gap-2"
            >
              {APPEARANCE_OPTIONS.mutation_markings.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleUpdate('mutation_markings', option.value)}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                    mutant?.mutation_markings === option.value
                      ? 'border-pink-400 bg-pink-950 text-white'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-pink-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Mutation Aura */}
        <div>
          <button
            onClick={() => setEditingField(editingField === 'mutation_aura' ? null : 'mutation_aura')}
            className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-white font-medium flex justify-between items-center"
          >
            Mutation Aura Intensity
            <span className="text-xs text-gray-400 capitalize">
              {mutant?.mutation_aura || 'Faint'}
            </span>
          </button>
          {editingField === 'mutation_aura' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 grid grid-cols-5 gap-2"
            >
              {['none', 'faint', 'visible', 'intense', 'overwhelming'].map(option => (
                <button
                  key={option}
                  onClick={() => handleUpdate('mutation_aura', option)}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-xs font-medium capitalize ${
                    mutant?.mutation_aura === option
                      ? 'border-pink-400 bg-pink-950 text-white'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-pink-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}