
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAgreements } from '@/hooks/useAgreementsContext';
import { Agreement } from '@/types/agreement';
import { toast } from '@/lib/toast';
import { 
  getAgreementById as getAgreementByIdUtil,
  ensureAgreementInStorage
} from '@/utils/agreementUtils';

export const useAgreementLoader = (id: string | undefined) => {
  const { user } = useAuth();
  const { getAgreementById } = useAgreements();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  const loadAgreement = () => {
    if (!id) {
      console.log("No agreement ID provided in URL");
      setNotFound(true);
      setLocalLoading(false);
      return;
    }

    console.log("Loading agreement with ID:", id);

    try {
      // First try from context
      let foundAgreement = getAgreementById(id);
      
      // If not found in context, try directly from localStorage
      if (!foundAgreement) {
        console.log('Agreement not found in context, trying localStorage...');
        foundAgreement = getAgreementByIdUtil(id);
        
        // If found in localStorage but not in context, add it to the context
        if (foundAgreement) {
          console.log('Agreement found in localStorage but not in context, ensuring it is in storage');
          ensureAgreementInStorage(foundAgreement);
          
          // Set the agreement in the local state
          setAgreement(foundAgreement);
          document.title = `Agreement | PactPal`;
          
          // Trigger a storage event to refresh the agreements in other tabs
          const event = new Event('agreementsUpdated');
          document.dispatchEvent(event);
          
          setLocalLoading(false);
          return;
        }
      }
      
      if (foundAgreement) {
        console.log('Agreement found:', foundAgreement);
        
        // For pending agreements, anyone can view them (even not logged in users)
        // Also allow viewing of any accepted agreement without login requirement
        setAgreement(foundAgreement);
        document.title = `Agreement | PactPal`;
      } else {
        console.log('Agreement not found with ID:', id);
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error loading agreement:", error);
      setNotFound(true);
      toast.error("Error loading agreement. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    loadAgreement();
    
    // Listen for storage events to reload agreement if it changes in another tab
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'pact_pal_agreements') {
        console.log("Storage event detected, reloading agreement");
        loadAgreement();
      }
    };
    
    // Also listen for custom events from the current tab
    const handleCustomEvent = () => {
      console.log("Custom event detected, reloading agreement");
      loadAgreement();
    };
    
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('agreementsUpdated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('agreementsUpdated', handleCustomEvent);
    };
  }, [id, getAgreementById, user]);

  return {
    agreement,
    notFound,
    accessDenied,
    localLoading,
    setAgreement
  };
};
