
import { useState } from 'react';
import { useAgreements } from '@/hooks/useAgreementsContext';
import { useAgreementValidation } from './useAgreementValidation';
import { Agreement } from '@/types/agreement';
import { updateAgreementInSupabase } from '@/utils/supabaseAgreementUtils';

export const useAgreementActions = (agreement: Agreement | null, setAgreement: React.Dispatch<React.SetStateAction<Agreement | null>>) => {
  const { respondToAgreement, requestDeleteAgreement, adminDeleteAgreement, getAgreementById } = useAgreements();
  const { logAccess } = useAgreementValidation(agreement);
  const [isResponding, setIsResponding] = useState(false);

  const handleResponse = async (accept: boolean) => {
    if (!agreement?.id) return;
    
    try {
      setIsResponding(true);
      
      // Call the respondToAgreement function from context
      await respondToAgreement(agreement.id, accept);
      
      // Update the local agreement state after response
      const updatedAgreement = await getAgreementById(agreement.id);
      if (updatedAgreement) {
        setAgreement(updatedAgreement);
        
        // Also update in Supabase
        await updateAgreementInSupabase(updatedAgreement);
      }
      
      logAccess('respond', true, undefined, accept ? 'accepted' : 'declined');
    } catch (error) {
      console.error("Error responding to agreement:", error);
      logAccess('respond', false, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsResponding(false);
    }
  };
  
  const handleRequestDelete = async () => {
    if (!agreement?.id) return false;
    
    try {
      const isAdmin = agreement.recipientId === 'admin@example.com';
      if (isAdmin) {
        await adminDeleteAgreement(agreement.id);
        logAccess('delete', true, undefined, 'Admin deletion');
        return true; // Indicate successful deletion for navigation
      } else {
        await requestDeleteAgreement(agreement.id);
        // Update the local agreement state after delete request
        const updatedAgreement = await getAgreementById(agreement.id);
        if (updatedAgreement) {
          setAgreement(updatedAgreement);
          
          // Also update in Supabase
          await updateAgreementInSupabase(updatedAgreement);
          
          logAccess('requestDelete', true);
          return false; // No navigation needed
        } else {
          // Agreement was fully deleted
          logAccess('delete', true);
          return true; // Indicate successful deletion for navigation
        }
      }
    } catch (error) {
      console.error("Error requesting deletion:", error);
      logAccess('delete', false, error instanceof Error ? error.message : 'Unknown error');
      return false; // No navigation needed
    }
  };

  return {
    isResponding,
    handleResponse,
    handleRequestDelete
  };
};
