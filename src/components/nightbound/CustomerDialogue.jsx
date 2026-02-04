import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, DollarSign, Users, AlertTriangle, Heart, Skull } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function CustomerDialogue({ customer, hunter, availableStrains = [], onClose }) {
  const queryClient = useQueryClient();
  const [conversation, setConversation] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [dialogueOptions, setDialogueOptions] = useState([]);
  const [outcome, setOutcome] = useState('');

  const startConversation = async () => {
    setProcessing(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Customer approaches drug dealer. Generate opening dialogue.

Customer Profile:
- Name: ${customer.name}
- Type: ${customer.customer_type}
- Addiction Level: ${customer.addiction_level || 0}/100
- Trust: ${customer.trust_level || 50}/100
- Mood: ${customer.current_mood || 'calm'}
- Relationship: ${customer.relationship_type}
- Debt: $${customer.debt_owed || 0}
- Life Status: ${customer.life_status}
- Days Clean: ${customer.days_clean || 0}
- Withdrawal: ${customer.withdrawal_stage || 'none'}
- Personality: ${customer.personality_traits?.join(', ') || 'neutral'}

Generate:
1. opening_line: What customer says (1-2 sentences, emotional, revealing their state)
2. body_language: Physical description of their appearance/behavior
3. need_urgency: How desperate they are (0-100)
4. hidden_agenda: What they're not saying (one sentence)

Make it dark, realistic, and emotionally charged.`,
        response_json_schema: {
          type: 'object',
          properties: {
            opening_line: { type: 'string' },
            body_language: { type: 'string' },
            need_urgency: { type: 'number' },
            hidden_agenda: { type: 'string' }
          }
        }
      });

      setConversation([{
        speaker: customer.name,
        text: response.opening_line,
        bodyLanguage: response.body_language,
        urgency: response.need_urgency,
        hiddenAgenda: response.hidden_agenda
      }]);

      await generateDialogueOptions(response);
      setProcessing(false);
    } catch (e) {
      console.error('Dialogue generation failed:', e);
      setConversation([{
        speaker: customer.name,
        text: customer.withdrawal_stage === 'peak' ? 
          "Please... I need something. Anything. I'm dying here." :
          `Hey. Got any ${customer.preferred_strain || 'product'}?`,
        bodyLanguage: 'Looking anxious',
        urgency: 70
      }]);
      setDialogueOptions([
        { type: 'sell', label: 'Sell them product', icon: '💊' },
        { type: 'negotiate', label: 'Negotiate price', icon: '💰' },
        { type: 'refuse', label: 'Refuse sale', icon: '🚫' },
        { type: 'manipulate', label: 'Exploit their need', icon: '🎭' }
      ]);
      setProcessing(false);
    }
  };

  const generateDialogueOptions = async (contextData) => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 4-5 dealer dialogue options based on customer state.

Context:
- Customer urgency: ${contextData.need_urgency || 70}/100
- Addiction: ${customer.addiction_level || 0}/100
- Trust: ${customer.trust_level || 50}/100
- Debt: $${customer.debt_owed || 0}
- Manipulation control: ${customer.dealer_manipulation || 0}/100
- Hidden agenda: ${contextData.hidden_agenda}

Generate varied options:
1. A business-like transaction option
2. A negotiation/haggling option  
3. A manipulative/exploitative option
4. A compassionate/helpful option
5. A dangerous/threatening option (if debt or high addiction)

Format: {option_label: string, option_type: string, predicted_outcome: string, risks: string}`,
        response_json_schema: {
          type: 'object',
          properties: {
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  option_label: { type: 'string' },
                  option_type: { type: 'string' },
                  predicted_outcome: { type: 'string' },
                  risks: { type: 'string' }
                }
              }
            }
          }
        }
      });

      const icons = { sell: '💊', negotiate: '💰', refuse: '🚫', manipulate: '🎭', threaten: '⚠️', help: '💝' };
      setDialogueOptions(response.options.map(opt => ({
        type: opt.option_type,
        label: opt.option_label,
        icon: icons[opt.option_type] || '💬',
        outcome: opt.predicted_outcome,
        risks: opt.risks
      })));
    } catch (e) {
      console.error('Options generation failed:', e);
      setDialogueOptions([
        { type: 'sell', label: 'Sell standard product', icon: '💊', outcome: 'Transaction complete' },
        { type: 'negotiate', label: 'Discuss price', icon: '💰', outcome: 'May get better deal' },
        { type: 'refuse', label: 'Turn them away', icon: '🚫', outcome: 'They leave angry' },
        { type: 'manipulate', label: 'Increase dependency', icon: '🎭', outcome: 'More control over them' }
      ]);
    }
  };

  const handleDialogueChoice = async (choice) => {
    setProcessing(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Dealer chose: "${choice.label}" (${choice.type})

Customer State:
- Name: ${customer.name}
- Addiction: ${customer.addiction_level || 0}/100
- Trust: ${customer.trust_level || 50}/100
- Debt: $${customer.debt_owed || 0}
- Betrayal potential: ${customer.betrayal_potential || 0}/100
- Negotiation skill: ${customer.negotiation_skill || 30}/100
- Available money: ~$${Math.floor(Math.random() * 500 + 100)}

Generate outcome:
1. customer_response: What they say/do (2-3 sentences, emotional)
2. dealer_success: Did dealer achieve goal? (0-100)
3. relationship_change: Trust/friendship change (-30 to +30)
4. addiction_change: Change in addiction (-20 to +40)
5. betrayal_change: Change in betrayal risk (-20 to +30)
6. price_negotiated: Final price if sale ($0 if refused)
7. referral_offered: Did customer offer to bring friends? (boolean)
8. secret_revealed: Did customer reveal something dangerous? (boolean)
9. consequence_text: One sentence about long-term effect

Make it realistic, dark, with real consequences.`,
        response_json_schema: {
          type: 'object',
          properties: {
            customer_response: { type: 'string' },
            dealer_success: { type: 'number' },
            relationship_change: { type: 'number' },
            addiction_change: { type: 'number' },
            betrayal_change: { type: 'number' },
            price_negotiated: { type: 'number' },
            referral_offered: { type: 'boolean' },
            secret_revealed: { type: 'boolean' },
            consequence_text: { type: 'string' }
          }
        }
      });

      // Update customer based on outcome
      const updates = {
        trust_level: Math.max(0, Math.min(100, (customer.trust_level || 50) + response.relationship_change)),
        friendship: Math.max(0, Math.min(100, (customer.friendship || 0) + response.relationship_change)),
        addiction_level: Math.max(0, Math.min(100, (customer.addiction_level || 0) + response.addiction_change)),
        betrayal_potential: Math.max(0, Math.min(100, (customer.betrayal_potential || 0) + response.betrayal_change)),
        last_conversation: `${choice.label} - ${response.consequence_text}`
      };

      if (response.price_negotiated > 0) {
        updates.total_spent = (customer.total_spent || 0) + response.price_negotiated;
        updates.purchase_count = (customer.purchase_count || 0) + 1;
        updates.last_purchase = new Date().toISOString();
      }

      if (response.referral_offered) {
        updates.referral_count = (customer.referral_count || 0) + 1;
      }

      if (response.secret_revealed) {
        updates.knows_dealer_secret = true;
        updates.threat_level = Math.min(100, (customer.threat_level || 0) + 30);
      }

      if (customer.id) {
        await base44.entities.DrugCustomer.update(customer.id, updates);
      }

      // Check for betrayal event
      if (updates.betrayal_potential > 80 && Math.random() < 0.3) {
        await triggerBetrayalEvent(customer, response);
      }

      // Check for referral event
      if (response.referral_offered && updates.trust_level > 60) {
        await triggerReferralEvent(customer);
      }

      await base44.entities.NightLog.create({
        entry: `${hunter.name} dealt with ${customer.name}. ${response.consequence_text}`,
        category: 'dark_deed',
        intensity: response.dealer_success > 70 ? 'significant' : 'moderate'
      });

      setOutcome(`💬 ${customer.name}: "${response.customer_response}"\n\n` +
        `📊 Results:\n` +
        `${response.dealer_success > 70 ? '✅' : response.dealer_success > 40 ? '⚠️' : '❌'} Success: ${response.dealer_success}%\n` +
        `${response.relationship_change >= 0 ? '💚' : '💔'} Trust: ${response.relationship_change >= 0 ? '+' : ''}${response.relationship_change}\n` +
        `💉 Addiction: ${response.addiction_change >= 0 ? '+' : ''}${response.addiction_change}\n` +
        `${response.betrayal_change >= 0 ? '⚠️' : '✅'} Betrayal Risk: ${response.betrayal_change >= 0 ? '+' : ''}${response.betrayal_change}\n` +
        (response.price_negotiated > 0 ? `💰 Sale: $${response.price_negotiated}\n` : '') +
        (response.referral_offered ? `👥 Will bring friends!\n` : '') +
        (response.secret_revealed ? `🔒 Revealed dangerous info!\n` : '') +
        `\n📝 ${response.consequence_text}`
      );

      queryClient.invalidateQueries(['drugCustomers']);

      setTimeout(() => {
        setProcessing(false);
        setTimeout(() => {
          onClose();
        }, 2000);
      }, 50);
    } catch (e) {
      console.error('Dialogue processing failed:', e);
      setProcessing(false);
      setOutcome('Something went wrong with the conversation.');
    }
  };

  const triggerBetrayalEvent = async (customer, dialogueResponse) => {
    if (!customer?.id) return;
    
    const betrayalTypes = ['police_informant', 'rival_dealer', 'blackmail', 'robbery'];
    const betrayalType = betrayalTypes[Math.floor(Math.random() * betrayalTypes.length)];

    await base44.entities.DrugCustomer.update(customer.id, {
      police_informant: betrayalType === 'police_informant',
      relationship_type: 'enemy',
      threat_level: 100
    });

    await base44.entities.NightLog.create({
      entry: `⚠️ BETRAYAL: ${customer.name} ${
        betrayalType === 'police_informant' ? 'went to the police with information' :
        betrayalType === 'rival_dealer' ? 'is now working for a rival dealer' :
        betrayalType === 'blackmail' ? 'is threatening to expose secrets' :
        'is planning to rob the operation'
      }. Danger level: EXTREME.`,
      category: 'dark_deed',
      intensity: 'extreme'
    });
  };

  const triggerReferralEvent = async (customer) => {
    const newCustomerName = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Taylor'][Math.floor(Math.random() * 6)];
    
    await base44.entities.DrugCustomer.create({
      name: newCustomerName,
      customer_type: Math.random() < 0.8 ? 'human' : 'vampire',
      addiction_level: Math.floor(Math.random() * 30) + 20,
      referred_by: customer.id,
      trust_level: 40,
      friendship: 30,
      personality_traits: ['cautious', 'curious']
    });

    await base44.entities.NightLog.create({
      entry: `${customer.name} referred ${newCustomerName}. New customer acquired through network.`,
      category: 'interaction',
      intensity: 'moderate'
    });
  };

  React.useEffect(() => {
    if (conversation.length === 0) {
      startConversation();
    }
  }, []);

  if (processing && outcome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900 rounded-2xl p-8 max-w-lg w-full border-2 border-purple-500/50"
        >
          <p className="text-purple-200 text-sm leading-relaxed whitespace-pre-line">
            {outcome}
          </p>
        </motion.div>
      </motion.div>
    );
  }

  if (processing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95"
      >
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}>
          <MessageSquare className="w-12 h-12 text-purple-400" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-purple-100">💬 Conversation</h2>
            <p className="text-purple-300 text-sm">{customer.name} • {customer.current_mood || 'calm'}</p>
          </div>
          <button onClick={onClose} className="text-purple-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Stats */}
        <div className="bg-black/40 rounded-lg p-4 mb-6 border border-purple-500/30">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-gray-400">Trust</p>
              <p className="text-cyan-400 font-bold">{customer.trust_level || 50}%</p>
            </div>
            <div>
              <p className="text-gray-400">Addiction</p>
              <p className="text-red-400 font-bold">{Math.round(customer.addiction_level || 0)}%</p>
            </div>
            <div>
              <p className="text-gray-400">Betrayal Risk</p>
              <p className="text-orange-400 font-bold">{customer.betrayal_potential || 0}%</p>
            </div>
          </div>
        </div>

        {/* Conversation Display */}
        <div className="space-y-4 mb-6">
          {conversation.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
            >
              <p className="text-purple-400 font-bold mb-2">{msg.speaker}</p>
              <p className="text-white mb-2">"{msg.text}"</p>
              {msg.bodyLanguage && (
                <p className="text-gray-400 text-xs italic">*{msg.bodyLanguage}*</p>
              )}
              {msg.urgency > 70 && (
                <p className="text-red-400 text-xs mt-2">⚠️ Extremely desperate</p>
              )}
              {msg.hiddenAgenda && (
                <p className="text-yellow-400 text-xs mt-2">🤔 Hidden: {msg.hiddenAgenda}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Dialogue Options */}
        {dialogueOptions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-white font-bold mb-3">Your Response:</h3>
            {dialogueOptions.map((option, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleDialogueChoice(option)}
                className="w-full bg-gradient-to-r from-purple-900/60 to-purple-950/60 hover:from-purple-900/80 hover:to-purple-950/80 border border-purple-500/30 rounded-lg p-4 text-left transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-bold mb-1">{option.label}</p>
                    {option.outcome && (
                      <p className="text-purple-300 text-xs mb-1">→ {option.outcome}</p>
                    )}
                    {option.risks && (
                      <p className="text-yellow-400 text-xs">⚠️ {option.risks}</p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}