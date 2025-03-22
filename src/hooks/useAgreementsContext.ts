
import { useContext } from 'react';
import { AgreementContext } from '@/context/AgreementContext';

export const useAgreements = () => {
  const context = useContext(AgreementContext);
  
  if (context === undefined) {
    throw new Error('useAgreements must be used within an AgreementProvider');
  }
  
  return context;
};
