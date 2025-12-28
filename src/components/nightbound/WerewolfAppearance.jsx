import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Moon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const HUMAN_OPTIONS = {
  hair_color: ['Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray', 'White', 'Blue', 'Green', 'Purple'],
  hair_style: ['Short', 'Medium', 'Long', 'Buzzed', 'Shaggy', 'Wild', 'Braided', 'Dreadlocks'],
  eye_color: ['Amber', 'Gold', 'Green', 'Blue', 'Brown', 'Gray', 'Hazel', 'Yellow', 'Silver'],
  skin_tone: ['Pale', 'Fair', 'Tan', 'Olive', 'Dark', 'Deep Brown'],
  build: ['Slim', 'Athletic', 'Muscular', 'Stocky', 'Heavy', 'Lean'],
  height: ['Short', 'Average', 'Tall', 'Very Tall'],
  clothing_style: ['Casual', 'Rugged', 'Dark', 'Leather', 'Grunge', 'Minimal', 'Outdoorsy', 'Street']
};

const WOLF_OPTIONS = {
  fur_color: ['Gray', 'Black', 'White', 'Brown', 'Red', 'Silver', 'Golden', 'Tawny', 'Midnight Blue'],
  fur_pattern: ['Solid', 'Grizzled', 'Spotted', 'Striped', 'Mottled', 'Two-Tone', 'Gradient'],
  eye_color: ['Amber', 'Gold', 'Yellow', 'Silver', 'Ice Blue', 'Green', 'Red', 'White'],
  size: ['Medium', 'Large', 'Massive', 'Dire Wolf Size'],
  tail_style: ['Bushy', 'Sleek', 'Fluffy', 'Long', 'Short'],
  ear_shape: ['Pointed', 'Rounded', 'Tufted', 'Large', 'Small']
};

const SCAR_OPTIONS = [
  'Claw marks across face',
  'Bite mark on shoulder',
  'Slash across chest',
  'Deep scar on arm',
  'Torn ear',
  'Jagged neck scar',
  'Battle scars on back',
  'Old bite wound'
];

const MARKING_OPTIONS = [
  'White chest patch',
  'Facial markings',
  'Darker muzzle',
  'Leg stripes',
  'Back saddle pattern',
  'Tail tip coloring',
  'Ear tufts',
  'Paw markings'
];

const TATTOO_OPTIONS = [
  'Moon phases',
  'Wolf paw print',
  'Pack symbol',
  'Tribal patterns',
  'Forest scene',
  'Celtic knots',
  'Runes',
  'Wolf head'
];

export default function WerewolfAppearance({ werewolf, onClose }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('human');
  const [saving, setSaving] = useState(false);
  
  const humanApp = werewolf.human_appearance || {};
  const wolfApp = werewolf.wolf_appearance || {};

  const updateAppearance = async (field, value, isWolf = false) => {
    setSaving(true);
    try {
      const appKey = isWolf ? 'wolf_appearance' : 'human_appearance';
      const currentApp = isWolf ? wolfApp : humanApp;
      const packMembers = Array.isArray(werewolf.pack_members) ? werewolf.pack_members : [];
      
      await base44.entities.PlayerWerewolf.update(werewolf.id, {
        pack_members: packMembers,
        [appKey]: {
          ...currentApp,
          [field]: value
        }
      });
      
      queryClient.invalidateQueries(['playerWerewolves']);
    } catch (e) {
      console.error('Failed to update appearance:', e);
    }
    setSaving(false);
  };

  const toggleArrayItem = async (field, item, isWolf = false) => {
    const appKey = isWolf ? 'wolf_appearance' : 'human_appearance';
    const currentApp = isWolf ? wolfApp : humanApp;
    const currentArray = currentApp[field] || [];
    const packMembers = Array.isArray(werewolf.pack_members) ? werewolf.pack_members : [];
    
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    
    setSaving(true);
    try {
      await base44.entities.PlayerWerewolf.update(werewolf.id, {
        pack_members: packMembers,
        [appKey]: {
          ...currentApp,
          [field]: newArray
        }
      });
      
      queryClient.invalidateQueries(['playerWerewolves']);
    } catch (e) {
      console.error('Failed to update appearance:', e);
    }
    setSaving(false);
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
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-orange-950 to-amber-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border-2 border-orange-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Customize Appearance</h2>
        <p className="text-orange-300 text-sm mb-6">Shape both your human and wolf forms</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('human')}
            className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'human' 
                ? 'bg-orange-600 text-white' 
                : 'bg-black/40 text-gray-400 hover:bg-black/60'
            }`}
          >
            <User className="w-4 h-4" />
            Human Form
          </button>
          <button
            onClick={() => setActiveTab('wolf')}
            className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'wolf' 
                ? 'bg-orange-600 text-white' 
                : 'bg-black/40 text-gray-400 hover:bg-black/60'
            }`}
          >
            <Moon className="w-4 h-4" />
            Wolf Form
          </button>
        </div>

        {saving && (
          <div className="mb-4 bg-green-900/40 border border-green-500/30 rounded-lg p-2 text-center">
            <p className="text-green-300 text-sm">Saving...</p>
          </div>
        )}

        {/* Human Form */}
        {activeTab === 'human' && (
          <div className="space-y-6">
            {Object.entries(HUMAN_OPTIONS).map(([key, options]) => (
              <div key={key}>
                <label className="text-white font-medium mb-2 block capitalize">
                  {key.replace('_', ' ')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {options.map(option => (
                    <button
                      key={option}
                      onClick={() => updateAppearance(key, option.toLowerCase())}
                      className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                        (humanApp[key] || HUMAN_OPTIONS[key][0].toLowerCase()) === option.toLowerCase()
                          ? 'bg-orange-600 text-white'
                          : 'bg-black/40 text-gray-300 hover:bg-black/60'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Scars */}
            <div>
              <label className="text-white font-medium mb-2 block">Scars</label>
              <div className="space-y-2">
                {SCAR_OPTIONS.map(scar => (
                  <button
                    key={scar}
                    onClick={() => toggleArrayItem('scars', scar)}
                    className={`w-full py-2 px-3 rounded-lg text-sm text-left transition-colors ${
                      (humanApp.scars || []).includes(scar)
                        ? 'bg-red-900/60 text-white border-2 border-red-500/50'
                        : 'bg-black/40 text-gray-300 hover:bg-black/60'
                    }`}
                  >
                    {scar}
                  </button>
                ))}
              </div>
            </div>

            {/* Tattoos */}
            <div>
              <label className="text-white font-medium mb-2 block">Tattoos</label>
              <div className="space-y-2">
                {TATTOO_OPTIONS.map(tattoo => (
                  <button
                    key={tattoo}
                    onClick={() => toggleArrayItem('tattoos', tattoo)}
                    className={`w-full py-2 px-3 rounded-lg text-sm text-left transition-colors ${
                      (humanApp.tattoos || []).includes(tattoo)
                        ? 'bg-purple-900/60 text-white border-2 border-purple-500/50'
                        : 'bg-black/40 text-gray-300 hover:bg-black/60'
                    }`}
                  >
                    {tattoo}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Wolf Form */}
        {activeTab === 'wolf' && (
          <div className="space-y-6">
            {Object.entries(WOLF_OPTIONS).map(([key, options]) => (
              <div key={key}>
                <label className="text-white font-medium mb-2 block capitalize">
                  {key.replace('_', ' ')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {options.map(option => (
                    <button
                      key={option}
                      onClick={() => updateAppearance(key, option.toLowerCase(), true)}
                      className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                        (wolfApp[key] || WOLF_OPTIONS[key][0].toLowerCase()) === option.toLowerCase()
                          ? 'bg-orange-600 text-white'
                          : 'bg-black/40 text-gray-300 hover:bg-black/60'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Markings */}
            <div>
              <label className="text-white font-medium mb-2 block">Fur Markings</label>
              <div className="space-y-2">
                {MARKING_OPTIONS.map(marking => (
                  <button
                    key={marking}
                    onClick={() => toggleArrayItem('markings', marking, true)}
                    className={`w-full py-2 px-3 rounded-lg text-sm text-left transition-colors ${
                      (wolfApp.markings || []).includes(marking)
                        ? 'bg-amber-900/60 text-white border-2 border-amber-500/50'
                        : 'bg-black/40 text-gray-300 hover:bg-black/60'
                    }`}
                  >
                    {marking}
                  </button>
                ))}
              </div>
            </div>

            {/* Wolf Scars */}
            <div>
              <label className="text-white font-medium mb-2 block">Battle Scars</label>
              <div className="space-y-2">
                {SCAR_OPTIONS.map(scar => (
                  <button
                    key={scar}
                    onClick={() => toggleArrayItem('scars', scar, true)}
                    className={`w-full py-2 px-3 rounded-lg text-sm text-left transition-colors ${
                      (wolfApp.scars || []).includes(scar)
                        ? 'bg-red-900/60 text-white border-2 border-red-500/50'
                        : 'bg-black/40 text-gray-300 hover:bg-black/60'
                    }`}
                  >
                    {scar}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}