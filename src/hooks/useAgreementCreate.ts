
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
      await simulateApiDelay();
      
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
      
      // Get the latest agreements from storage to avoid race conditions
      const latestAgreements = getStoredAgreements();
      
      // Check if this ID is somehow already in use (extremely unlikely but good practice)
      if (latestAgreements.some(a => a.id === uniqueId)) {
        console.error("Generated ID collision - this should be virtually impossible");
        throw new Error("Failed to create agreement: ID collision");
      }
      
      const updatedAgreements = [...latestAgreements, newAgreement];
      const saveSuccess = saveAgreements(updatedAgreements);
      
      if (!saveSuccess) {
        throw new Error("Failed to save agreement to storage");
      }
      
      setAgreements(updatedAgreements);
      setLastCreatedId(uniqueId);
      
      // Log successful creation
      logAccessAttempt({
        userId: user.id,
        userName: user.name,
        action: 'create',
        agreementId: uniqueId,
        timestamp: new Date().toISOString(),
        success: true,
      });
      
      toast.success('Agreement created!');
      return uniqueId;
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
