
import { useState, useEffect, useCallback } from 'react';
import { Agreement } from '@/types/agreement';
import { getStoredAgreements, getAgreementById as getAgreementByIdUtil } from '@/utils/agreementStorage';
import { fetchUserAgreements } from '@/utils/supabaseAgreementUtils';
import { toast } from '@/lib/toast';

export const useAgreementData = (userId: string | undefined, isAdmin: boolean = false) => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAgreements = useCallback(async () => {
    try {
      console.log("Loading agreements...");
      setLoading(true);
      
      // Get agreements from localStorage for backward compatibility
      const storedAgreements = getStoredAgreements();
      console.log("Loaded agreements from localStorage:", storedAgreements.length);
      
      // If user is logged in, also fetch from Supabase
      if (userId) {
        console.log(`Fetching agreements for user ${userId} from Supabase`);
        const supabaseAgreements = await fetchUserAgreements(userId);
        console.log(`Fetched ${supabaseAgreements.length} agreements from Supabase`);
        
        // Merge agreements, preferring Supabase data for duplicates
        const mergedAgreements = [...storedAgreements];
        
        for (const supabaseAgreement of supabaseAgreements) {
          const existingIndex = mergedAgreements.findIndex(a => a.id === supabaseAgreement.id);
          if (existingIndex >= 0) {
            // Update existing agreement with Supabase data
            mergedAgreements[existingIndex] = supabaseAgreement;
          } else {
            // Add new agreement from Supabase
            mergedAgreements.push(supabaseAgreement);
          }
        }
        
        setAgreements(mergedAgreements);
      } else {
        // Just use localStorage data if no user is logged in
        setAgreements(storedAgreements);
      }
    } catch (error) {
      console.error("Error loading agreements:", error);
      toast.error("Failed to load agreements. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAgreements();
    
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
    
    // Set up an interval to refresh agreements periodically
    const intervalId = setInterval(loadAgreements, 60000); // Refresh every minute
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('agreementsUpdated', handleCustomEvent);
      clearInterval(intervalId);
    };
  }, [loadAgreements]);

  const getAgreementById = useCallback((id: string): Agreement | undefined => {
    if (!id) {
      console.log("No ID provided to getAgreementById");
      return undefined;
    }
    
    console.log(`Looking for agreement with ID: ${id}`);
    
    // First try to find it in the current state
    const agreementInState = agreements.find(a => a.id === id);
    
    if (agreementInState) {
      console.log("Agreement found in state:", agreementInState);
      return agreementInState;
    } else {
      console.log("Agreement not found in state, checking localStorage...");
    }
    
    // If not found in state, try to find it in localStorage directly
    const agreementFromStorage = getAgreementByIdUtil(id);
    
    if (agreementFromStorage) {
      console.log("Agreement found in localStorage:", agreementFromStorage);
      // Update the state with this agreement if it's not already there
      if (!agreements.some(a => a.id === id)) {
        setAgreements(prev => [...prev, agreementFromStorage]);
      }
      return agreementFromStorage;
    } else {
      console.log(`No agreement found with ID: ${id}`);
    }
    
    // Note: Supabase fetching is now handled in the useAgreementLoader hook
    return undefined;
  }, [agreements]);

  // Filter agreements by creator/recipient if not admin
  let sentAgreements: Agreement[] = [];
  let receivedAgreements: Agreement[] = [];
  let allAgreements: Agreement[] = [];
  
  if (isAdmin) {
    // Admin has access to all agreements
    allAgreements = [...agreements];
    
    // Still populate sent/received for filtering purposes
    sentAgreements = userId ? agreements.filter(a => a.creatorId === userId) : [];
    receivedAgreements = userId ? agreements.filter(a => a.recipientId === userId) : [];
  } else {
    // Regular users only see agreements they're involved in
    sentAgreements = userId ? agreements.filter(a => a.creatorId === userId) : [];
    receivedAgreements = userId ? agreements.filter(a => a.recipientId === userId) : [];
    
    // All agreements a regular user can access (union of sent and received)
    allAgreements = [...sentAgreements, ...receivedAgreements];
  }

  return {
    agreements: isAdmin ? agreements : [...sentAgreements, ...receivedAgreements],
    allAgreements,
    setAgreements,
    loading,
    setLoading,
    sentAgreements,
    receivedAgreements,
    getAgreementById,
    loadAgreements
  };
};
