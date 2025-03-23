
import { useAuth } from '@/context/AuthContext';
import { useAgreementLoader } from './agreement-detail/useAgreementLoader';
import { useAgreementValidation } from './agreement-detail/useAgreementValidation';
import { useAgreementActions } from './agreement-detail/useAgreementActions';

export const useAgreementDetail = (id: string | undefined) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Get agreement data
  const {
    agreement,
    notFound,
    accessDenied,
    localLoading,
    setAgreement
  } = useAgreementLoader(id);
  
  // Get validation state
  const {
    isCreator,
    isRecipient,
    canRespond,
    canDelete,
    hasRequestedDelete
  } = useAgreementValidation(agreement);
  
  // Get actions
  const {
    isResponding,
    handleResponse,
    handleRequestDelete
  } = useAgreementActions(agreement, setAgreement);

  return {
    agreement,
    notFound,
    accessDenied,
    localLoading,
    isResponding,
    isCreator,
    isRecipient,
    canRespond,
    canDelete,
    hasRequestedDelete,
    handleResponse,
    handleRequestDelete,
    isAuthenticated,
    isAdmin
  };
};
