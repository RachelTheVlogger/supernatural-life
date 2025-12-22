import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Package, ShoppingBag, MessageCircle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function ServantProactiveActions({ servant }) {
  const queryClient = useQueryClient();
  const [suggestion, setSuggestion] = useState(null);
  const [processing, setProcessing] = useState(false);

  const { data: automation } = useQuery({
    queryKey: ['automation', servant.id],
    queryFn: async () => {
      const settings = await base44.entities.ServantAutomation.filter({ servant_id: servant.id });
      return settings[0] || null;
    }
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory', servant.id],
    queryFn: () => base44.entities.Inventory.filter({ servant_id: servant.id }),
    enabled: !!automation
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', servant.id],
    queryFn: () => base44.entities.BusinessOrder.filter({ servant_id: servant.id }),
    enabled: !!automation
  });

  useEffect(() => {
    if (!automation || automation.autonomy_level === 'low') return;
    if ((servant.relationship || 0) < automation.min_relationship_for_auto) return;

    // Check for suggestions every 30 seconds
    const interval = setInterval(() => {
      checkForSuggestions();
    }, 30000);

    // Initial check
    checkForSuggestions();

    return () => clearInterval(interval);
  }, [automation, inventory, orders, servant]);

  const checkForSuggestions = () => {
    if (!automation || suggestion) return;

    const canCraft = inventory.some(i => i.quantity >= 2);
    const needsRestock = inventory.length === 0 || inventory.every(i => i.quantity < 2);
    const completedOrders = orders.filter(o => o.status === 'completed');
    
    const suggestions = [];

    // Crafting suggestion
    if (canCraft && automation.autonomy_level !== 'low') {
      suggestions.push({
        type: 'craft',
        icon: Sparkles,
        title: 'Craft Jewelry',
        message: servant.variant === 'devoted' 
          ? 'I have materials ready. May I craft something beautiful for you?' 
          : servant.variant === 'defiant'
          ? 'Materials are just sitting there. I could craft something if you want.'
          : 'I see patterns in the materials. Should I create something?',
        action: 'craft'
      });
    }

    // Restock suggestion
    if (needsRestock && automation.autonomy_level !== 'low') {
      suggestions.push({
        type: 'restock',
        icon: ShoppingBag,
        title: 'Restock Materials',
        message: servant.variant === 'devoted'
          ? 'We\'re running low on materials. Shall I order more?'
          : servant.variant === 'defiant'
          ? 'Materials are low. Want me to get more or not?'
          : 'The supplies are fading. Time to replenish?',
        action: 'restock'
      });
    }

    // Shipping suggestion
    if (completedOrders.length > 0 && automation.autonomy_level !== 'low') {
      suggestions.push({
        type: 'ship',
        icon: Package,
        title: 'Ship Orders',
        message: servant.variant === 'devoted'
          ? `${completedOrders.length} order${completedOrders.length > 1 ? 's are' : ' is'} ready. May I send them out?`
          : servant.variant === 'defiant'
          ? `Got ${completedOrders.length} completed orders. Should I ship them?`
          : `${completedOrders.length} pieces await their journey. Send them?`,
        action: 'ship'
      });
    }

    // Random proactive message (high autonomy only)
    if (automation.autonomy_level === 'high' && automation.auto_message_respond && Math.random() > 0.8) {
      suggestions.push({
        type: 'message',
        icon: MessageCircle,
        title: 'Check-in',
        message: servant.variant === 'devoted'
          ? 'Just thinking about you. Everything okay?'
          : servant.variant === 'defiant'
          ? 'You\'ve been quiet. That worries me.'
          : 'I felt your presence shift. Are you well?',
        action: 'message'
      });
    }

    if (suggestions.length > 0) {
      setSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
    }
  };

  const handleAccept = async () => {
    if (!suggestion) return;
    setProcessing(true);

    try {
      if (suggestion.action === 'craft') {
        // Auto-craft logic
        const materials = ['silver', 'moonstone', 'onyx', 'obsidian', 'garnet', 'amethyst', 'chain', 'wire'];
        const items = [
          { name: 'Raven Pendant', materials: { silver: 1, onyx: 1, chain: 1 } },
          { name: 'Moon Phase Ring', materials: { silver: 1, moonstone: 1 } },
          { name: 'Thorn Choker', materials: { obsidian: 2, wire: 1 } },
          { name: 'Blood Drop Earrings', materials: { garnet: 2, wire: 1 } }
        ];

        const craftableItems = items.filter(item => {
          return Object.entries(item.materials).every(([mat, qty]) => {
            const inv = inventory.find(i => i.material === mat);
            return inv && inv.quantity >= qty;
          });
        });

        if (craftableItems.length > 0) {
          const item = craftableItems[Math.floor(Math.random() * craftableItems.length)];
          
          // Deduct materials
          for (const [mat, qty] of Object.entries(item.materials)) {
            const inv = inventory.find(i => i.material === mat);
            await base44.entities.Inventory.update(inv.id, {
              quantity: inv.quantity - qty
            });
          }

          // Create order
          await base44.entities.BusinessOrder.create({
            customer_name: ['Luna', 'Raven', 'Ash', 'Willow', 'Salem'][Math.floor(Math.random() * 5)],
            item: item.name,
            price: Math.floor(Math.random() * 30) + 40,
            status: 'completed',
            message: 'Can\'t wait to receive this!',
            servant_id: servant.id
          });
        }
      } else if (suggestion.action === 'restock') {
        // Auto-restock logic
        const materials = ['silver', 'moonstone', 'onyx', 'obsidian', 'garnet', 'amethyst', 'chain', 'wire'];
        const toBuy = materials[Math.floor(Math.random() * materials.length)];
        const amount = Math.floor(Math.random() * 3) + 3;

        const existing = inventory.find(i => i.material === toBuy);
        if (existing) {
          await base44.entities.Inventory.update(existing.id, {
            quantity: existing.quantity + amount
          });
        } else {
          await base44.entities.Inventory.create({
            servant_id: servant.id,
            material: toBuy,
            quantity: amount
          });
        }
      } else if (suggestion.action === 'ship') {
        // Ship completed orders
        const completedOrders = orders.filter(o => o.status === 'completed');
        for (const order of completedOrders) {
          await base44.entities.BusinessOrder.update(order.id, {
            status: 'shipped'
          });

          // Random review
          if (Math.random() > 0.4) {
            const rating = Math.random() > 0.2 ? 5 : 4;
            const comments = {
              5: ['Perfect! Love this piece!', 'Exceeded my expectations!', 'Beautiful craftsmanship!'],
              4: ['Very nice. Happy with it.', 'Good quality piece.', 'Exactly as described.']
            };
            
            await base44.entities.Review.create({
              servant_id: servant.id,
              customer_name: order.customer_name,
              rating: rating,
              comment: comments[rating][Math.floor(Math.random() * comments[rating].length)],
              order_id: order.id
            });
          }
        }
      } else if (suggestion.action === 'message') {
        // Send proactive message
        await base44.entities.Message.create({
          servant_id: servant.id,
          content: suggestion.message,
          sender: 'servant'
        });
      }

      // Update last action time
      if (automation) {
        await base44.entities.ServantAutomation.update(automation.id, {
          last_auto_action: new Date().toISOString()
        });
      }

      await base44.entities.NightLog.create({
        entry: `${servant.name} ${suggestion.action === 'craft' ? 'crafted jewelry' : suggestion.action === 'restock' ? 'restocked materials' : suggestion.action === 'ship' ? 'shipped orders' : 'sent you a message'} proactively.`,
        category: 'interaction',
        intensity: 'subtle'
      });

      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Automation error:', error);
    }

    setProcessing(false);
    setSuggestion(null);
  };

  const handleDismiss = () => {
    setSuggestion(null);
  };

  if (!automation || automation.autonomy_level === 'low') return null;

  return (
    <AnimatePresence>
      {suggestion && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-4 right-4 z-40 max-w-md mx-auto"
        >
          <div className="bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/30 shadow-xl">
            <div className="flex items-start gap-3">
              <suggestion.icon className="w-6 h-6 text-purple-300 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">{servant.name} suggests:</h3>
                <p className="text-purple-100 text-sm mb-3">{suggestion.message}</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAccept}
                    disabled={processing}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : 'Yes, please'}
                  </button>
                  <button
                    onClick={handleDismiss}
                    disabled={processing}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}