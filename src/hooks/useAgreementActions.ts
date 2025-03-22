
import { Agreement } from '@/types/agreement';
import { useAgreementCreate } from './useAgreementCreate';
import { useAgreementRespond } from './useAgreementRespond';
import { useAgreementDelete } from './useAgreementDelete';

export const useAgreementActions = (
  agreements: Agreement[],
  setAgreements: React.Dispatch<React.SetStateAction<Agreement[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  isAdmin: boolean = false
) => {
  // Use the individual hooks
  const { isSubmitting: isCreating, createAgreement } = useAgreementCreate(
    agreements, 
    setAgreements, 
    setLoading
  );
  
  const { isSubmitting: isResponding, respondToAgreement } = useAgreementRespond(
    agreements, 
    setAgreements, 
    setLoading,
    isAdmin
  );
  
  const { 
    isSubmitting: isDeleting, 
    requestDeleteAgreement, 
    adminDeleteAgreement 
  } = useAgreementDelete(
    agreements, 
    setAgreements, 
    setLoading,
    isAdmin
  );

  // Combine the isSubmitting states
  const isSubmitting = isCreating || isResponding || isDeleting;

  return {
    isSubmitting,
    createAgreement,
    respondToAgreement,
    requestDeleteAgreement,
    adminDeleteAgreement
  };
};
