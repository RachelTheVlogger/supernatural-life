import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Settings, Sparkles, Package, MessageCircle, ShoppingBag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const AUTONOMY_LEVELS = {
  low: {
    label: 'Low Autonomy',
    description: 'Servant waits for your commands. No automated actions.',
    icon: '🔒'
  },
  medium: {
    label: 'Medium Autonomy', 
    description: 'Servant suggests actions and can perform simple tasks automatically.',
    icon: '⚡'
  },
  high: {
    label: 'High Autonomy',
    description: 'Servant acts independently, managing business and routines proactively.',
    icon: '✨'
  }
};

export default function ServantAutomationSettings({ servant, onClose }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  
  const { data: automationSettings } = useQuery({
    queryKey: ['automation', servant.id],
    queryFn: async () => {
      const settings = await base44.entities.ServantAutomation.filter({ servant_id: servant.id });
      return settings[0] || null;
    }
  });

  const [settings, setSettings] = useState({
    auto_craft: automationSettings?.auto_craft || false,
    auto_restock: automationSettings?.auto_restock || false,
    auto_ship: automationSettings?.auto_ship || false,
    auto_message_respond: automationSettings?.auto_message_respond || false,
    min_relationship_for_auto: automationSettings?.min_relationship_for_auto || 50,
    autonomy_level: automationSettings?.autonomy_level || 'low'
  });

  const handleSave = async () => {
    setSaving(true);
    
    if (automationSettings) {
      await base44.entities.ServantAutomation.update(automationSettings.id, settings);
    } else {
      await base44.entities.ServantAutomation.create({
        ...settings,
        servant_id: servant.id
      });
    }
    
    queryClient.invalidateQueries(['automation', servant.id]);
    
    setTimeout(() => {
      setSaving(false);
      onClose();
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Automation Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Configure {servant.name}'s routines and autonomy level.
        </p>

        {/* Autonomy Level */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Autonomy Level</h3>
          <div className="space-y-2">
            {Object.entries(AUTONOMY_LEVELS).map(([level, info]) => (
              <button
                key={level}
                onClick={() => setSettings({ ...settings, autonomy_level: level })}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  settings.autonomy_level === level
                    ? 'border-purple-500 bg-purple-950/30'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{info.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">{info.label}</h4>
                    <p className="text-gray-400 text-sm">{info.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Automated Routines */}
        {(settings.autonomy_level === 'medium' || settings.autonomy_level === 'high') && (
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3">Automated Routines</h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.auto_craft}
                  onChange={(e) => setSettings({ ...settings, auto_craft: e.target.checked })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-medium">Auto-Craft Jewelry</span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    Automatically craft jewelry when materials are available
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.auto_restock}
                  onChange={(e) => setSettings({ ...settings, auto_restock: e.target.checked })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingBag className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium">Auto-Restock Materials</span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    Automatically buy materials when inventory is low
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.auto_ship}
                  onChange={(e) => setSettings({ ...settings, auto_ship: e.target.checked })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-green-400" />
                    <span className="text-white font-medium">Auto-Ship Orders</span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    Automatically package and ship completed orders
                  </p>
                </div>
              </label>

              {settings.autonomy_level === 'high' && (
                <label className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.auto_message_respond}
                    onChange={(e) => setSettings({ ...settings, auto_message_respond: e.target.checked })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-4 h-4 text-pink-400" />
                      <span className="text-white font-medium">Auto-Respond to Messages</span>
                    </div>
                    <p className="text-gray-400 text-xs">
                      Servant will occasionally send you messages on their own
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Minimum Relationship */}
        {settings.autonomy_level !== 'low' && (
          <div className="mb-6">
            <label className="text-white font-medium mb-2 block">
              Minimum Relationship for Auto-Actions: {settings.min_relationship_for_auto}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={settings.min_relationship_for_auto}
              onChange={(e) => setSettings({ ...settings, min_relationship_for_auto: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-gray-400 text-xs mt-1">
              Servant needs at least {settings.min_relationship_for_auto}% bond to perform automated actions
            </p>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bitlife-btn py-3 rounded-xl disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </motion.div>
    </motion.div>
  );
}