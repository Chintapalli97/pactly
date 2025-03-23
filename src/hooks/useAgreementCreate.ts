
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
import supabase from '@/utils/supabase';

export const useAgreementCreate = (
  agreements: Agreement[],
  setAgreements: React.Dispatch<React.SetStateAction<Agreement[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  const createAgreement = async (message: string): Promise<string> => {
    if (!user) throw new Error('You must be logged in to create an agreement');
    
    setLoading(true);
    setIsSubmitting(true);
    
    try {
      // Generate a unique ID for the agreement
      const uniqueId = crypto.randomUUID();
      console.log(`Generated unique ID for new agreement: ${uniqueId}`);
      
      const newAgreement: Agreement = {
        id: uniqueId,
        message,
        createdAt: new Date().toISOString(),
        creatorId: user.id,
        creatorName: user.name,
        status: 'pending',
        deleteRequestedBy: []
      };
      
      // First save to Supabase
      const supabaseId = await createAgreementInSupabase(newAgreement);
      
      // If Supabase save failed, throw an error
      if (!supabaseId) {
        throw new Error("Failed to save agreement to Supabase");
      }
      
      console.log(`Agreement successfully saved to Supabase with ID: ${supabaseId}`);
      
      // If Supabase returned a different ID, update our agreement
      if (supabaseId !== uniqueId) {
        console.log(`Supabase assigned a different ID: ${supabaseId}, updating local agreement`);
        newAgreement.id = supabaseId;
      }
      
      // Get the latest agreements from storage to avoid race conditions
      const latestAgreements = getStoredAgreements();
      
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
      
      // Log successful creation
      logAccessAttempt({
        userId: user.id,
        userName: user.name,
        action: 'create',
        agreementId: newAgreement.id,
        timestamp: new Date().toISOString(),
        success: true,
      });
      
      toast.success('Agreement created!');
      return newAgreement.id;
    } catch (error: any) {
      // Log failed attempt
      if (user) {
        logAccessAttempt({
          userId: user.id,
          userName: user.name,
          action: 'create',
          timestamp: new Date().toISOString(),
          success: false,
          error: error.message,
        });
      }
      
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
