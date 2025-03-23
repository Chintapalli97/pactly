
import { useCallback } from 'react';
import { Agreement } from '@/types/agreement';
import { getAgreementById as getAgreementByIdUtil, ensureAgreementInStorage } from '@/utils/agreementStorage';
import { fetchAgreementById } from '@/utils/supabaseAgreementUtils';

export const useAgreementFinder = (
  agreements: Agreement[],
  setAgreements: React.Dispatch<React.SetStateAction<Agreement[]>>
) => {
  const getAgreementById = useCallback(async (id: string): Promise<Agreement | undefined> => {
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
      console.log("Agreement not found in state, checking Supabase...");
    }
    
    // If not found in state, try to find it in Supabase
    const agreementFromSupabase = await fetchAgreementById(id);
    
    if (agreementFromSupabase) {
      console.log("Agreement found in Supabase:", agreementFromSupabase);
      // Update the state with this agreement if it's not already there
      if (!agreements.some(a => a.id === id)) {
        setAgreements(prev => [...prev, agreementFromSupabase]);
      }
      return agreementFromSupabase;
    } else {
      console.log("Agreement not found in Supabase, checking localStorage...");
    }
    
    // If not found in Supabase, try to find it in localStorage directly
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
    
    return undefined;
  }, [agreements, setAgreements]);

  return { getAgreementById };
};
