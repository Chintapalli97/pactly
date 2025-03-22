
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { Agreement, AgreementStatus } from '@/types/agreement';
import { 
  saveAgreements, 
  simulateApiDelay,
  addNotificationForUser
} from '@/utils/agreementUtils';

export const useAgreementActions = (
  agreements: Agreement[],
  setAgreements: React.Dispatch<React.SetStateAction<Agreement[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createAgreement = async (message: string): Promise<string> => {
    if (!user) throw new Error('You must be logged in to create an agreement');
    
    setLoading(true);
    setIsSubmitting(true);
    
    try {
      await simulateApiDelay();
      
      const newAgreement: Agreement = {
        id: crypto.randomUUID(),
        message,
        createdAt: new Date().toISOString(),
        creatorId: user.id,
        creatorName: user.name,
        status: 'pending' as AgreementStatus,
        deleteRequestedBy: []
      };
      
      const updatedAgreements = [...agreements, newAgreement];
      saveAgreements(updatedAgreements);
      setAgreements(updatedAgreements);
      
      toast.success('Agreement created!');
      return newAgreement.id;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create agreement');
      throw error;
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const respondToAgreement = async (id: string, accept: boolean) => {
    if (!user) throw new Error('You must be logged in to respond to an agreement');
    
    setLoading(true);
    setIsSubmitting(true);
    
    try {
      await simulateApiDelay();
      
      const updatedAgreements = agreements.map(agreement => {
        if (agreement.id === id) {
          // Notify the creator of the response
          addNotificationForUser(agreement.creatorId);
          
          return {
            ...agreement,
            recipientId: user.id,
            recipientName: user.name,
            status: accept ? 'accepted' as AgreementStatus : 'declined' as AgreementStatus
          };
        }
        return agreement;
      });
      
      saveAgreements(updatedAgreements);
      setAgreements(updatedAgreements);
      toast.success(`Agreement ${accept ? 'accepted' : 'declined'}!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to respond to agreement');
      throw error;
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const requestDeleteAgreement = async (id: string) => {
    if (!user) throw new Error('You must be logged in to delete an agreement');
    
    setLoading(true);
    setIsSubmitting(true);
    
    try {
      await simulateApiDelay();
      
      let updatedAgreements = [...agreements];
      const agreementIndex = updatedAgreements.findIndex(a => a.id === id);
      
      if (agreementIndex === -1) {
        throw new Error('Agreement not found');
      }
      
      const agreement = updatedAgreements[agreementIndex];
      
      // If the agreement is pending and the user is the creator, they can delete it immediately
      if (agreement.status === 'pending' && agreement.creatorId === user.id) {
        updatedAgreements = updatedAgreements.filter(a => a.id !== id);
        toast.success('Agreement deleted!');
      } 
      // For accepted agreements, both parties need to request deletion
      else if (agreement.status === 'accepted') {
        if (!agreement.deleteRequestedBy.includes(user.id)) {
          agreement.deleteRequestedBy.push(user.id);
          
          // Notify the other user about the delete request
          const otherUserId = user.id === agreement.creatorId ? 
            agreement.recipientId : agreement.creatorId;
          if (otherUserId) {
            addNotificationForUser(otherUserId);
          }
          
          if (agreement.deleteRequestedBy.length === 2) {
            updatedAgreements = updatedAgreements.filter(a => a.id !== id);
            toast.success('Agreement deleted!');
          } else {
            toast.info('Delete requested. The agreement will be deleted when the other party also requests deletion.');
            updatedAgreements[agreementIndex] = agreement;
          }
        } else {
          toast.info('You already requested to delete this agreement');
        }
      } else {
        toast.error('You cannot delete this agreement');
      }
      
      saveAgreements(updatedAgreements);
      setAgreements(updatedAgreements);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete agreement');
      throw error;
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    createAgreement,
    respondToAgreement,
    requestDeleteAgreement
  };
};
