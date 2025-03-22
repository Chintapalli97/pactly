
import { useState, useEffect, useCallback } from 'react';
import { Agreement } from '@/types/agreement';
import { getStoredAgreements, getAgreementById as getAgreementByIdUtil } from '@/utils/agreementUtils';

export const useAgreementData = (userId: string | undefined) => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAgreements = useCallback(() => {
    try {
      console.log("Loading agreements from storage...");
      const storedAgreements = getStoredAgreements();
      console.log("Loaded agreements:", storedAgreements.length);
      setAgreements(storedAgreements);
    } catch (error) {
      console.error("Error loading agreements:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgreements();
    
    // Set up storage event listener to catch changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'pact_pal_agreements') {
        console.log("Storage event detected, reloading agreements");
        loadAgreements();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadAgreements]);

  const getAgreementById = useCallback((id: string): Agreement | undefined => {
    if (!id) return undefined;
    
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
    } else {
      console.log(`No agreement found with ID: ${id}`);
    }
    
    return agreementFromStorage;
  }, [agreements]);

  // Filter agreements by creator/recipient
  const sentAgreements = userId 
    ? agreements.filter(a => a.creatorId === userId)
    : [];
    
  const receivedAgreements = userId 
    ? agreements.filter(a => a.recipientId === userId)
    : [];

  return {
    agreements,
    setAgreements,
    loading,
    setLoading,
    sentAgreements,
    receivedAgreements,
    getAgreementById,
    loadAgreements
  };
};
