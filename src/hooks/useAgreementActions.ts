
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { Agreement, AgreementStatus } from '@/types/agreement';
import { 
  saveAgreements, 
  simulateApiDelay,
  addNotificationForUser,
  logAccessAttempt
} from '@/utils/agreementUtils';

export const useAgreementActions = (
  agreements: Agreement[],
  setAgreements: React.Dispatch<React.SetStateAction<Agreement[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  isAdmin: boolean = false
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
      
      // Log access attempt
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
            status: accept ? 'accepted' as AgreementStatus : 'declined' as AgreementStatus
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
      
      // Check if user has permission to delete
      const isCreator = agreement.creatorId === user.id;
      const isRecipient = agreement.recipientId === user.id;
      
      if (!isCreator && !isRecipient && !isAdmin) {
        logAccessAttempt({
          userId: user.id,
          userName: user.name,
          action: 'delete',
          agreementId: id,
          timestamp: new Date().toISOString(),
          success: false,
          error: 'Unauthorized',
        });
        throw new Error('You are not authorized to delete this agreement');
      }
      
      // If the agreement is pending and the user is the creator or an admin, they can delete it immediately
      if ((agreement.status === 'pending' && isCreator) || isAdmin) {
        updatedAgreements = updatedAgreements.filter(a => a.id !== id);
        toast.success('Agreement deleted!');
        
        logAccessAttempt({
          userId: user.id,
          userName: user.name,
          action: 'delete',
          agreementId: id,
          timestamp: new Date().toISOString(),
          success: true,
          details: 'Immediate deletion',
        });
      } 
      // For accepted agreements, both parties need to request deletion (unless admin)
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
            
            logAccessAttempt({
              userId: user.id,
              userName: user.name,
              action: 'delete',
              agreementId: id,
              timestamp: new Date().toISOString(),
              success: true,
              details: 'Both parties requested deletion',
            });
          } else {
            toast.info('Delete requested. The agreement will be deleted when the other party also requests deletion.');
            updatedAgreements[agreementIndex] = agreement;
            
            logAccessAttempt({
              userId: user.id,
              userName: user.name,
              action: 'requestDelete',
              agreementId: id,
              timestamp: new Date().toISOString(),
              success: true,
            });
          }
        } else {
          toast.info('You already requested to delete this agreement');
        }
      } else {
        toast.error('You cannot delete this agreement');
        
        logAccessAttempt({
          userId: user.id,
          userName: user.name,
          action: 'delete',
          agreementId: id,
          timestamp: new Date().toISOString(),
          success: false,
          error: 'Invalid status for deletion',
        });
      }
      
      saveAgreements(updatedAgreements);
      setAgreements(updatedAgreements);
    } catch (error: any) {
      // Log failed attempt
      if (user) {
        logAccessAttempt({
          userId: user.id,
          userName: user.name,
          action: 'delete',
          agreementId: id,
          timestamp: new Date().toISOString(),
          success: false,
          error: error.message,
        });
      }
      
      toast.error(error.message || 'Failed to delete agreement');
      throw error;
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };
  
  // Admin-only function to delete any agreement immediately
  const adminDeleteAgreement = async (id: string) => {
    if (!user) throw new Error('You must be logged in to delete an agreement');
    if (!isAdmin) throw new Error('Only admins can perform this action');
    
    setLoading(true);
    setIsSubmitting(true);
    
    try {
      await simulateApiDelay();
      
      const updatedAgreements = agreements.filter(a => a.id !== id);
      
      if (updatedAgreements.length === agreements.length) {
        throw new Error('Agreement not found');
      }
      
      saveAgreements(updatedAgreements);
      setAgreements(updatedAgreements);
      
      logAccessAttempt({
        userId: user.id,
        userName: user.name,
        action: 'adminDelete',
        agreementId: id,
        timestamp: new Date().toISOString(),
        success: true,
        details: 'Admin deletion',
      });
      
      toast.success('Agreement deleted by admin!');
    } catch (error: any) {
      // Log failed attempt
      logAccessAttempt({
        userId: user.id,
        userName: user.name,
        action: 'adminDelete',
        agreementId: id,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message,
      });
      
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
    requestDeleteAgreement,
    adminDeleteAgreement
  };
};
