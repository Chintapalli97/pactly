import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAgreements } from '@/hooks/useAgreementsContext';
import { Agreement } from '@/types/agreement';
import { toast } from '@/lib/toast';
import { 
  getAgreementById as getAgreementByIdUtil,
  ensureAgreementInStorage,
  logAccessAttempt
} from '@/utils/agreementUtils';

export const useAgreementDetail = (id: string | undefined) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { getAgreementById, respondToAgreement, requestDeleteAgreement, adminDeleteAgreement, hasAccess } = useAgreements();
  const [isResponding, setIsResponding] = useState(false);
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const loadAgreement = () => {
      if (!id) {
        console.log("No agreement ID provided in URL");
        setNotFound(true);
        setLocalLoading(false);
        return;
      }

      console.log("Loading agreement with ID:", id);

      try {
        // First try from context
        let foundAgreement = getAgreementById(id);
        
        // If not found in context, try directly from localStorage
        if (!foundAgreement) {
          console.log('Agreement not found in context, trying localStorage...');
          foundAgreement = getAgreementByIdUtil(id);
          
          // If found in localStorage but not in context, add it to the context
          if (foundAgreement) {
            console.log('Agreement found in localStorage but not in context, ensuring it is in storage');
            ensureAgreementInStorage(foundAgreement);
            
            // Set the agreement in the local state
            setAgreement(foundAgreement);
            document.title = `Agreement | PactPal`;
            
            // Trigger a storage event to refresh the agreements in other tabs
            const event = new Event('agreementsUpdated');
            document.dispatchEvent(event);
            
            // Log successful access if user is logged in
            if (user) {
              logAccessAttempt({
                userId: user.id,
                userName: user.name,
                action: 'view',
                agreementId: id,
                timestamp: new Date().toISOString(),
                success: true,
              });
            }
            
            setLocalLoading(false);
            return;
          }
        }
        
        if (foundAgreement) {
          console.log('Agreement found:', foundAgreement);
          
          // For pending agreements, anyone can view them (even not logged in users)
          // Also allow viewing of any accepted agreement without login requirement
          setAgreement(foundAgreement);
          document.title = `Agreement | PactPal`;
          
          // Log successful access if user is logged in
          if (user) {
            logAccessAttempt({
              userId: user.id,
              userName: user.name,
              action: 'view',
              agreementId: id,
              timestamp: new Date().toISOString(),
              success: true,
              details: isAdmin ? 'Admin access' : undefined,
            });
          }
        } else {
          console.log('Agreement not found with ID:', id);
          setNotFound(true);
          
          // Log failed access attempt if user is logged in
          if (user) {
            logAccessAttempt({
              userId: user.id,
              userName: user.name,
              action: 'view',
              agreementId: id || 'unknown',
              timestamp: new Date().toISOString(),
              success: false,
              error: 'Agreement not found',
            });
          }
        }
      } catch (error) {
        console.error("Error loading agreement:", error);
        setNotFound(true);
        toast.error("Error loading agreement. Please try again.");
        
        // Log error if user is logged in
        if (user) {
          logAccessAttempt({
            userId: user.id,
            userName: user.name,
            action: 'view',
            agreementId: id || 'unknown',
            timestamp: new Date().toISOString(),
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      } finally {
        setLocalLoading(false);
      }
    };
    
    loadAgreement();
    
    // Listen for storage events to reload agreement if it changes in another tab
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'pact_pal_agreements') {
        console.log("Storage event detected, reloading agreement");
        loadAgreement();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from the current tab
    const handleCustomEvent = () => {
      console.log("Custom event detected, reloading agreement");
      loadAgreement();
    };
    
    document.addEventListener('agreementsUpdated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('agreementsUpdated', handleCustomEvent);
    };
  }, [id, getAgreementById, user, isAdmin, hasAccess]);

  const handleResponse = async (accept: boolean) => {
    if (!id) return;
    
    try {
      setIsResponding(true);
      await respondToAgreement(id, accept);
      // Update the local agreement state after response
      const updatedAgreement = getAgreementById(id);
      if (updatedAgreement) {
        setAgreement(updatedAgreement);
      }
    } catch (error) {
      console.error("Error responding to agreement:", error);
      toast.error("Failed to respond to agreement. Please try again.");
    } finally {
      setIsResponding(false);
    }
  };
  
  const handleRequestDelete = async () => {
    if (!id) return;
    
    try {
      if (isAdmin) {
        await adminDeleteAgreement(id);
        toast.success("Agreement deleted by admin!");
        return true; // Indicate successful deletion for navigation
      } else {
        await requestDeleteAgreement(id);
        // Update the local agreement state after delete request
        const updatedAgreement = getAgreementById(id);
        if (updatedAgreement) {
          setAgreement(updatedAgreement);
          return false; // No navigation needed
        } else {
          // Agreement was fully deleted
          setNotFound(true);
          return true; // Indicate successful deletion for navigation
        }
      }
    } catch (error) {
      console.error("Error requesting deletion:", error);
      toast.error("Failed to request deletion. Please try again.");
      return false; // No navigation needed
    }
  };

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
    handleRequestDelete
  };
};
