
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { Agreement } from '@/types/agreement';
import { 
  saveAgreements, 
  simulateApiDelay,
  addNotificationForUser,
  logAccessAttempt
} from '@/utils/agreementUtils';

export const useAgreementRespond = (
  agreements: Agreement[],
  setAgreements: React.Dispatch<React.SetStateAction<Agreement[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  isAdmin: boolean = false
) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const respondToAgreement = async (id: string, accept: boolean) => {
    if (!user) throw new Error('You must be logged in to respond to an agreement');
    
    setLoading(true);
    setIsSubmitting(true);
    
    try {
      await simulateApiDelay();
      
      const agreement = agreements.find(a => a.id === id);
      
      // Check if user has permission to respond to this agreement
      if (!agreement) {
        throw new Error('Agreement not found');
      }
      
      // Only the recipient or an admin can respond
      const isRecipient = !agreement.recipientId || agreement.recipientId === user.id;
      if (!isRecipient && !isAdmin) {
        logAccessAttempt({
          userId: user.id,
          userName: user.name,
          action: 'respond',
          agreementId: id,
          timestamp: new Date().toISOString(),
          success: false,
          error: 'Unauthorized',
        });
        throw new Error('You are not authorized to respond to this agreement');
      }
      
      const updatedAgreements = agreements.map(agreement => {
        if (agreement.id === id) {
          // Notify the creator of the response
          addNotificationForUser(agreement.creatorId);
          
          return {
            ...agreement,
            recipientId: user.id,
            recipientName: user.name,
            status: accept ? 'accepted' : 'declined'
          };
        }
        return agreement;
      });
      
      saveAgreements(updatedAgreements);
      setAgreements(updatedAgreements);
      
      // Log successful response
      logAccessAttempt({
        userId: user.id,
        userName: user.name,
        action: 'respond',
        agreementId: id,
        timestamp: new Date().toISOString(),
        success: true,
        details: accept ? 'accepted' : 'declined',
      });
      
      toast.success(`Agreement ${accept ? 'accepted' : 'declined'}!`);
    } catch (error: any) {
      // Log failed attempt
      if (user) {
        logAccessAttempt({
          userId: user.id,
          userName: user.name,
          action: 'respond',
          agreementId: id,
          timestamp: new Date().toISOString(),
          success: false,
          error: error.message,
        });
      }
      
      toast.error(error.message || 'Failed to respond to agreement');
      throw error;
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    respondToAgreement
  };
};
