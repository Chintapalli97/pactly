
import { useState, useEffect, useCallback } from 'react';
import { Agreement } from '@/types/agreement';
import { getStoredAgreements, getAgreementById as getAgreementByIdUtil } from '@/utils/agreementUtils';

export const useAgreementData = (userId: string | undefined) => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAgreements = useCallback(() => {
    const storedAgreements = getStoredAgreements();
    setAgreements(storedAgreements);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAgreements();
    
    // Set up storage event listener to catch changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'pact_pal_agreements') {
        loadAgreements();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadAgreements]);

  const getAgreementById = useCallback((id: string): Agreement | undefined => {
    // First try to find it in the current state
    const agreementInState = agreements.find(a => a.id === id);
    if (agreementInState) return agreementInState;
    
    // If not found in state, try to find it in localStorage directly
    return getAgreementByIdUtil(id);
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
