
import React, { createContext } from 'react';
import { useAuth } from './AuthContext';
import { Agreement } from '@/types/agreement';
import { useAgreementData } from '@/hooks/useAgreementData';
import { useAgreementActions } from '@/hooks/useAgreementActions';
import { useAgreementNotifications } from '@/hooks/useAgreementNotifications';

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
  
  // Use our custom hooks
  const { 
    agreements, 
    setAgreements,
    loading, 
    setLoading,
    sentAgreements,
    receivedAgreements,
    getAgreementById
  } = useAgreementData(user?.id);
  
  const { 
    createAgreement,
    respondToAgreement,
    requestDeleteAgreement 
  } = useAgreementActions(agreements, setAgreements, setLoading);
  
  const { 
    hasNewNotifications, 
    clearNotifications 
  } = useAgreementNotifications(user?.id);

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

export { useAgreements } from '@/hooks/useAgreementsContext';
