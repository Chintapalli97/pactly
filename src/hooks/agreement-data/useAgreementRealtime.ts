
import { useEffect } from 'react';
import supabase from '@/utils/supabase';

export const useAgreementRealtime = (loadAgreements: () => Promise<void>) => {
  useEffect(() => {
    // Set up Supabase realtime subscription for agreements
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agreements'
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          loadAgreements();
        }
      )
      .subscribe();
    
    // Set up storage event listener to catch changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'pact_pal_agreements') {
        console.log("Storage event detected, reloading agreements");
        loadAgreements();
      }
    };
    
    // Set up custom event listener to catch changes from the current tab
    const handleCustomEvent = () => {
      console.log("Custom event detected, reloading agreements");
      loadAgreements();
    };
    
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('agreementsUpdated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('agreementsUpdated', handleCustomEvent);
      supabase.removeChannel(channel);
    };
  }, [loadAgreements]);
};
