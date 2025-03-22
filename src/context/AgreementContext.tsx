
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
  allAgreements: Agreement[]; // For admin use
  loading: boolean;
  createAgreement: (message: string) => Promise<string>;
  respondToAgreement: (id: string, accept: boolean) => Promise<void>;
  requestDeleteAgreement: (id: string) => Promise<void>;
  adminDeleteAgreement: (id: string) => Promise<void>; // Admin-only function
  getAgreementById: (id: string) => Agreement | undefined;
  hasNewNotifications: boolean;
  clearNotifications: () => void;
  hasAccess: (agreementId: string) => boolean;
};

export const AgreementContext = createContext<AgreementContextType | undefined>(undefined);

export const AgreementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  
  // Use our custom hooks
  const { 
    agreements, 
    setAgreements,
    loading, 
    setLoading,
    sentAgreements,
    receivedAgreements,
    getAgreementById,
    allAgreements
  } = useAgreementData(user?.id, isAdmin);
  
  const { 
    createAgreement,
    respondToAgreement,
    requestDeleteAgreement,
    adminDeleteAgreement
  } = useAgreementActions(agreements, setAgreements, setLoading, isAdmin);
  
  const { 
    hasNewNotifications, 
    clearNotifications 
  } = useAgreementNotifications(user?.id);

  // Check if current user has access to an agreement
  const hasAccess = (agreementId: string): boolean => {
    // Admins have access to all agreements
    if (isAdmin) return true;

    // Regular users only have access to agreements they created or were invited to
    if (!user) return false;
    
    const agreement = getAgreementById(agreementId);
    if (!agreement) return false;

    // User has access if they created the agreement or are the recipient
    return agreement.creatorId === user.id || agreement.recipientId === user.id;
  };

  return (
    <AgreementContext.Provider value={{
      agreements,
      sentAgreements,
      receivedAgreements,
      allAgreements,
      loading,
      createAgreement,
      respondToAgreement,
      requestDeleteAgreement,
      adminDeleteAgreement,
      getAgreementById,
      hasNewNotifications,
      clearNotifications,
      hasAccess
    }}>
      {children}
    </AgreementContext.Provider>
  );
};
