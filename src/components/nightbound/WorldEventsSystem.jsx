import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Zap, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const EVENT_TEMPLATES = [
  { title: 'Blood Moon Rising', type: 'seasonal', severity: 80, desc: 'Vampire powers doubled. Hunters on high alert.', duration: 3 },
  { title: 'Hunter Uprising', type: 'crisis', severity: 90, desc: 'Coordinated hunter attacks across city.', duration: 5 },
  { title: 'Masquerade Breach', type: 'crisis', severity: 95, desc: 'Humans discovered vampires exist. Chaos spreads.', duration: 7 },
  { title: 'Ancient Evil Awakens', type: 'apocalyptic', severity: 100, desc: 'Primordial vampire rises. All must choose sides.', duration: 10 },
  { title: 'Solar Eclipse', type: 'seasonal', severity: 60, desc: 'Daywalking possible for all. Temporary freedom.', duration: 1 },
  { title: 'Witch Coven War', type: 'crisis', severity: 70, desc: 'Witch covens battling. City caught in crossfire.', duration: 4 }
];

export default function WorldEventsSystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [triggering, setTriggering] = useState(false);

  const { data: events = [] } = useQuery({
    queryKey: ['worldEvents'],
    queryFn: () => base44.entities.WorldEvent.filter({ is_active: true })
  });

  const handleTriggerEvent = async (template) => {
    setTriggering(true);

    await base44.entities.WorldEvent.create({
      title: template.title,
      description: template.desc,
      event_type: template.type,
      severity: template.severity,
      duration_nights: template.duration,
      is_active: true,
      can_be_stopped: template.type !== 'seasonal'
    });

    await base44.entities.NightLog.create({
      entry: `🚨 WORLD EVENT: ${template.title}. ${template.desc}`,
      category: 'event',
      intensity: 'extreme'
    });

    queryClient.invalidateQueries();
    setTriggering(false);
  };

  const handleResolveEvent = async (event) => {
    await base44.entities.WorldEvent.update(event.id, {
      is_active: false,
      resolution: 'Resolved by player action'
    });

    await base44.entities.NightLog.create({
      entry: `Event resolved: ${event.title}. Crisis averted. Peace restored.`,
      category: 'event',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
  };

  const getSeverityColor = (severity) => {
    if (severity >= 90) return 'red';
    if (severity >= 70) return 'orange';
    if (severity >= 50) return 'yellow';
    return 'blue';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">🌍 World Events</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {events.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white font-bold mb-3">Active Events</h3>
            {events.map(event => {
              const color = getSeverityColor(event.severity);
              return (
                <div key={event.id} className={`bg-${color}-950/30 border border-${color}-500/30 rounded-lg p-4 mb-3`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-6 h-6 text-${color}-400`} />
                    <div className="flex-1">
                      <p className="text-white font-bold text-lg">{event.title}</p>
                      <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                      <div className="flex gap-2 mb-3">
                        <span className={`text-xs px-2 py-1 rounded bg-${color}-900/50 text-${color}-300`}>
                          Severity: {event.severity}%
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300">
                          {event.duration_nights} nights
                        </span>
                      </div>
                      {event.can_be_stopped && (
                        <button
                          onClick={() => handleResolveEvent(event)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                        >
                          Resolve Event
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <h3 className="text-white font-bold mb-3">Trigger New Event</h3>
        <div className="space-y-3">
          {EVENT_TEMPLATES.map(template => {
            const color = getSeverityColor(template.severity);
            return (
              <button
                key={template.title}
                onClick={() => handleTriggerEvent(template)}
                disabled={triggering}
                className={`w-full bg-${color}-950/30 hover:bg-${color}-950/50 border border-${color}-500/30 rounded-lg p-4 text-left transition-colors disabled:opacity-50`}
              >
                <p className="text-white font-bold mb-1">{template.title}</p>
                <p className="text-gray-400 text-sm mb-2">{template.desc}</p>
                <div className="flex gap-2 text-xs">
                  <span className={`px-2 py-1 rounded bg-${color}-900/50 text-${color}-300`}>
                    {template.type}
                  </span>
                  <span className="px-2 py-1 rounded bg-gray-800 text-gray-300">
                    {template.duration} nights
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}