
import { useState } from 'react';
import { Agreement } from '@/types/agreement';

export const useAgreementState = () => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to filter agreements by creator/recipient
  const getFilteredAgreements = (userId: string | undefined, isAdmin: boolean = false) => {
    let sentAgreements: Agreement[] = [];
    let receivedAgreements: Agreement[] = [];
    let allAgreements: Agreement[] = [];
    
    if (isAdmin) {
      // Admin has access to all agreements
      allAgreements = [...agreements];
      
      // Still populate sent/received for filtering purposes
      sentAgreements = userId ? agreements.filter(a => a.creatorId === userId) : [];
      receivedAgreements = userId ? agreements.filter(a => a.recipientId === userId) : [];
    } else {
      // Regular users only see agreements they're involved in
      sentAgreements = userId ? agreements.filter(a => a.creatorId === userId) : [];
      receivedAgreements = userId ? agreements.filter(a => a.recipientId === userId) : [];
      
      // All agreements a regular user can access (union of sent and received)
      allAgreements = [...sentAgreements, ...receivedAgreements];
    }

    return {
      userAgreements: isAdmin ? agreements : [...sentAgreements, ...receivedAgreements],
      allAgreements,
      sentAgreements,
      receivedAgreements
    };
  };

  return {
    agreements,
    setAgreements,
    loading,
    setLoading,
    getFilteredAgreements
  };
};
