
import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/lib/toast';
import { Agreement, AgreementStatus } from '@/types/agreement';
import { 
  getStoredAgreements, 
  saveAgreements, 
  hasNewNotifications, 
  updateNotifications,
  addNotificationForUser,
  simulateApiDelay
} from '@/utils/agreementUtils';

type AgreementContextType = {
  agreements: Agreement[];
  sentAgreements: Agreement[];
  receivedAgreements: Agreement[];
  loading: boolean;
  createAgreement: (message: string) => Promise<string>;
  respondToAgreement: (id: string, accept: boolean) => Promise<void>;
  requestDeleteAgreement: (id: string) => Promise<void>;
  getAgreementById: (id: string) => Agreement | undefined;
  hasNewNotifications: boolean;
  clearNotifications: () => void;
};

export const AgreementContext = createContext<AgreementContextType | undefined>(undefined);

export const AgreementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNotifications, setHasNotifications] = useState(false);

  const sentAgreements = agreements.filter(a => a.creatorId === user?.id);
  const receivedAgreements = agreements.filter(a => a.recipientId === user?.id);

  useEffect(() => {
    const storedAgreements = getStoredAgreements();
    setAgreements(storedAgreements);
    setLoading(false);
    
    if (user) {
      setHasNotifications(hasNewNotifications(user.id));
    }
  }, [user]);

  const createAgreement = async (message: string): Promise<string> => {
    if (!user) throw new Error('You must be logged in to create an agreement');
    
    setLoading(true);
    try {
      await simulateApiDelay();
      
      const newAgreement: Agreement = {
        id: crypto.randomUUID(),
        message,
        createdAt: new Date().toISOString(),
        creatorId: user.id,
        creatorName: user.name,
        status: 'pending',
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
    }
  };

  const respondToAgreement = async (id: string, accept: boolean) => {
    if (!user) throw new Error('You must be logged in to respond to an agreement');
    
    setLoading(true);
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
    }
  };

  const requestDeleteAgreement = async (id: string) => {
    if (!user) throw new Error('You must be logged in to delete an agreement');
    
    setLoading(true);
    try {
      await simulateApiDelay();
      
      let updatedAgreements = [...agreements];
      const agreementIndex = updatedAgreements.findIndex(a => a.id === id);
      
      if (agreementIndex === -1) {
        throw new Error('Agreement not found');
      }
      
      const agreement = updatedAgreements[agreementIndex];
      
      if (agreement.status !== 'accepted') {
        throw new Error('Only accepted agreements can be deleted');
      }
      
      if (!agreement.deleteRequestedBy.includes(user.id)) {
        agreement.deleteRequestedBy.push(user.id);
        
        if (agreement.deleteRequestedBy.length === 2) {
          updatedAgreements = updatedAgreements.filter(a => a.id !== id);
          toast.success('Agreement deleted!');
        } else {
          toast.info('Delete requested. The agreement will be deleted when the other party also requests deletion.');
          updatedAgreements[agreementIndex] = agreement;
        }
        
        saveAgreements(updatedAgreements);
        setAgreements(updatedAgreements);
      } else {
        toast.info('You already requested to delete this agreement');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete agreement');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAgreementById = (id: string) => {
    return agreements.find(a => a.id === id);
  };

  const clearNotifications = () => {
    if (user) {
      updateNotifications(user.id, false);
      setHasNotifications(false);
    }
  };

  return (
    <AgreementContext.Provider value={{
      agreements,
      sentAgreements,
      receivedAgreements,
      loading,
      createAgreement,
      respondToAgreement,
      requestDeleteAgreement,
      getAgreementById,
      hasNewNotifications: hasNotifications,
      clearNotifications
    }}>
      {children}
    </AgreementContext.Provider>
  );
};

export { useAgreements } from '@/hooks/useAgreementsContext';
