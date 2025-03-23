
import { useEffect } from 'react';
import { useAgreementState } from './agreement-data/useAgreementState';
import { useAgreementLoader } from './agreement-data/useAgreementLoader';
import { useAgreementFinder } from './agreement-data/useAgreementFinder';
import { useAgreementRealtime } from './agreement-data/useAgreementRealtime';

export const useAgreementData = (userId: string | undefined, isAdmin: boolean = false) => {
  // Use the state management hook
  const { 
    agreements, 
    setAgreements, 
    loading, 
    setLoading,
    getFilteredAgreements 
  } = useAgreementState();
  
  // Use the agreement loader hook
  const { loadAgreements } = useAgreementLoader(userId, setAgreements, setLoading);
  
  // Use the agreement finder hook
  const { getAgreementById } = useAgreementFinder(agreements, setAgreements);
  
  // Use the realtime updates hook
  useAgreementRealtime(loadAgreements);

  // Call loadAgreements on first render and when userId changes
  useEffect(() => {
    loadAgreements();
  }, [userId, loadAgreements]);
  
  // Get filtered agreements based on user role
  const { 
    userAgreements,
    allAgreements,
    sentAgreements,
    receivedAgreements
  } = getFilteredAgreements(userId, isAdmin);

  return {
    agreements: userAgreements,
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
