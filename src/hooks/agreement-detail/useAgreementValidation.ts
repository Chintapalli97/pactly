
import { useAuth } from '@/context/AuthContext';
import { Agreement } from '@/types/agreement';
import { logAccessAttempt } from '@/utils/agreementUtils';

export const useAgreementValidation = (agreement: Agreement | null) => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Calculate derived state
  const isCreator = user?.id === agreement?.creatorId;
  const isRecipient = user?.id === agreement?.recipientId;
  const canRespond = isAuthenticated && 
                   agreement?.status === 'pending' && 
                   (!isCreator || isAdmin);
  const canDelete = isAuthenticated && 
                  (agreement?.status === 'accepted' && 
                   (isCreator || isRecipient) && 
                   !agreement.deleteRequestedBy.includes(user?.id || '')) || 
                  isAdmin;
  const hasRequestedDelete = user?.id ? agreement?.deleteRequestedBy.includes(user.id) : false;

  // Log access attempt
  const logAccess = (action: string, success: boolean, error?: string, details?: string) => {
    if (user && agreement) {
      logAccessAttempt({
        userId: user.id,
        userName: user.name,
        action,
        agreementId: agreement.id,
        timestamp: new Date().toISOString(),
        success,
        error,
        details: isAdmin ? (details || 'Admin access') : details,
      });
    }
  };

  return {
    isCreator,
    isRecipient,
    canRespond,
    canDelete,
    hasRequestedDelete,
    logAccess
  };
};
