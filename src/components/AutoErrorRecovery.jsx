import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function AutoErrorRecovery({ children }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Auto-fix missing data on mount
    const checkAndFixData = async () => {
      try {
        // Check for vampire state
        const vampires = await base44.entities.VampireState.list();
        
        // Check for servants
        const servants = await base44.entities.Servant.list();
        
        // Auto-fix: If servant has no variant, add one
        for (const servant of servants) {
          if (!servant.variant) {
            await base44.entities.Servant.update(servant.id, {
              variant: 'devoted',
              obsession_stage: servant.obsession_stage || 1,
              relationship: servant.relationship || 0
            });
          }
          
          // Auto-fix: If relationship is NaN or invalid
          if (typeof servant.relationship !== 'number' || isNaN(servant.relationship)) {
            await base44.entities.Servant.update(servant.id, {
              relationship: 0
            });
          }
        }

        // Auto-fix: If vampire has no unlocked_powers array
        for (const vampire of vampires) {
          if (!Array.isArray(vampire.unlocked_powers)) {
            await base44.entities.VampireState.update(vampire.id, {
              unlocked_powers: ['Enhanced Senses']
            });
          }
          
          // Auto-fix: If humanity is NaN
          if (typeof vampire.humanity !== 'number' || isNaN(vampire.humanity)) {
            await base44.entities.VampireState.update(vampire.id, {
              humanity: 50
            });
          }
        }

        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Auto-fix failed:', e);
      }
    };

    checkAndFixData();
  }, [queryClient]);

  return <>{children}</>;
}