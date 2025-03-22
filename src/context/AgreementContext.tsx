import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/lib/toast';

export type AgreementStatus = 'pending' | 'accepted' | 'declined';

export type Agreement = {
  id: string;
  message: string;
  createdAt: string;
  creatorId: string;
  creatorName: string;
  recipientId?: string;
  recipientName?: string;
  status: AgreementStatus;
  deleteRequestedBy: string[];
};

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

const AgreementContext = createContext<AgreementContextType | undefined>(undefined);

const AGREEMENTS_STORAGE_KEY = 'pact_pal_agreements';
const NOTIFICATIONS_KEY = 'pact_pal_notifications';

export const AgreementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  const sentAgreements = agreements.filter(a => a.creatorId === user?.id);
  const receivedAgreements = agreements.filter(a => a.recipientId === user?.id);

  useEffect(() => {
    if (!localStorage.getItem(AGREEMENTS_STORAGE_KEY)) {
      localStorage.setItem(AGREEMENTS_STORAGE_KEY, JSON.stringify([]));
    }
    
    const storedAgreements = JSON.parse(localStorage.getItem(AGREEMENTS_STORAGE_KEY) || '[]');
    setAgreements(storedAgreements);
    setLoading(false);
    
    if (user) {
      const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
      setHasNewNotifications(!!notifications[user.id]);
    }
  }, [user]);

  const saveAgreements = (updatedAgreements: Agreement[]) => {
    localStorage.setItem(AGREEMENTS_STORAGE_KEY, JSON.stringify(updatedAgreements));
    setAgreements(updatedAgreements);
  };

  const createAgreement = async (message: string): Promise<string> => {
    if (!user) throw new Error('You must be logged in to create an agreement');
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedAgreements = agreements.map(agreement => {
        if (agreement.id === id) {
          const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
          notifications[agreement.creatorId] = true;
          localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
          
          return {
            ...agreement,
            recipientId: user.id,
            recipientName: user.name,
            status: accept ? 'accepted' : 'declined' as AgreementStatus
          };
        }
        return agreement;
      });
      
      saveAgreements(updatedAgreements);
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
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
      notifications[user.id] = false;
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
      setHasNewNotifications(false);
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
      hasNewNotifications,
      clearNotifications
    }}>
      {children}
    </AgreementContext.Provider>
  );
};

export const useAgreements = () => {
  const context = useContext(AgreementContext);
  if (context === undefined) {
    throw new Error('useAgreements must be used within an AgreementProvider');
  }
  return context;
};
