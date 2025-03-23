
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { Agreement } from '@/types/agreement';
import { 
  saveAgreements, 
  simulateApiDelay,
  logAccessAttempt,
  getStoredAgreements
} from '@/utils/agreementUtils';
import { createAgreementInSupabase } from '@/utils/supabaseAgreementUtils';
import { useAgreementCreation } from './useAgreementCreation';

export const useAgreementCreate = (
  agreements: Agreement[],
  setAgreements: React.Dispatch<React.SetStateAction<Agreement[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
  const { createAgreement: createAgreementInSupabaseDirectly } = useAgreementCreation();

  const createAgreement = async (message: string): Promise<string> => {
    if (!user) throw new Error('You must be logged in to create an agreement');
    
    setLoading(true);
    setIsSubmitting(true);
    
    try {
      // First try to create the agreement directly in Supabase
      const agreementId = await createAgreementInSupabaseDirectly(message);
      
      if (!agreementId) {
        throw new Error("Failed to create agreement in Supabase");
      }
      
      console.log(`Agreement successfully created with ID: ${agreementId}`);
      
      // Get the latest agreements from storage to avoid race conditions
      const latestAgreements = getStoredAgreements();
      
      // Create a local Agreement object with the same ID
      const newAgreement: Agreement = {
        id: agreementId,
        message,
        createdAt: new Date().toISOString(),
        creatorId: user.id,
        creatorName: user.name,
        status: 'pending',
        deleteRequestedBy: []
      };
      
      // Check if this ID is somehow already in use
      if (latestAgreements.some(a => a.id === newAgreement.id)) {
        console.log("ID already exists in localStorage, but agreement was created in Supabase");
      }
      
      const updatedAgreements = [...latestAgreements, newAgreement];
      const saveSuccess = saveAgreements(updatedAgreements);
      
      if (!saveSuccess) {
        console.warn("Failed to save agreement to local storage, but it's saved in Supabase");
      }
      
      setAgreements(updatedAgreements);
      setLastCreatedId(newAgreement.id);
      
      toast.success('Agreement created!');
      return newAgreement.id;
    } catch (error: any) {
      console.error("Agreement creation failed:", error);
      toast.error(error.message || 'Failed to create agreement');
      throw error;
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    createAgreement,
    lastCreatedId
  };
};
