
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAgreements } from '@/hooks/useAgreementsContext';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import AgreementHeader from '@/components/agreement/AgreementHeader';
import AgreementParties from '@/components/agreement/AgreementParties';
import AgreementMessage from '@/components/agreement/AgreementMessage';
import AgreementActions from '@/components/agreement/AgreementActions';
import LoginPrompt from '@/components/agreement/LoginPrompt';
import LoadingState from '@/components/agreement/LoadingState';
import NotFoundState from '@/components/agreement/NotFoundState';
import { 
  getAgreementById as getAgreementByIdUtil,
  ensureAgreementInStorage,
  getStoredAgreements,
  logAccessAttempt
} from '@/utils/agreementUtils';
import { Agreement } from '@/types/agreement';
import { toast } from '@/lib/toast';
import { Info, Shield } from 'lucide-react';

const AgreementDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAgreementById, respondToAgreement, requestDeleteAgreement, adminDeleteAgreement, hasAccess } = useAgreements();
  const { user, isAuthenticated, isAdmin } = useAuth();
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
          if (foundAgreement.status === 'pending' || isAdmin) {
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
          }
          // For non-pending agreements, check access rights if user is logged in
          else if (user && !isAdmin) {
            const userHasAccess = hasAccess(id);
            if (!userHasAccess) {
              console.log('Access denied: User does not have permission to view this agreement');
              setAccessDenied(true);
              
              // Log access attempt
              logAccessAttempt({
                userId: user.id,
                userName: user.name,
                action: 'view',
                agreementId: id,
                timestamp: new Date().toISOString(),
                success: false,
                error: 'Access denied',
              });
              
              toast.error("You don't have permission to view this agreement");
            } else {
              setAgreement(foundAgreement);
              document.title = `Agreement | PactPal`;
              
              // Log successful access
              logAccessAttempt({
                userId: user.id,
                userName: user.name,
                action: 'view',
                agreementId: id,
                timestamp: new Date().toISOString(),
                success: true,
              });
            }
          } else {
            // Not admin, not logged in, and agreement is not pending
            setAgreement(foundAgreement);
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
  
  if (localLoading) {
    return <LoadingState />;
  }
  
  if (notFound) {
    return <NotFoundState />;
  }
  
  if (accessDenied) {
    return (
      <Layout>
        <div className="min-h-[80vh] max-w-2xl mx-auto animate-fade-in">
          <Card className="glass-card animate-scale-in">
            <CardHeader className="border-b bg-destructive/10">
              <div className="flex items-center gap-2 text-destructive">
                <Shield className="h-6 w-6" />
                <h2 className="text-xl font-semibold">Access Denied</h2>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle>Permission Error</AlertTitle>
                <AlertDescription>
                  <p className="mt-2">You don't have permission to view this agreement.</p>
                  <p className="mt-1">
                    This agreement may be private and limited to only the parties involved.
                  </p>
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <p>To view this agreement, you need to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Be the creator of the agreement</li>
                  <li>Be the designated recipient of the agreement</li>
                  <li>Have admin privileges on the system</li>
                </ul>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">
                  If you believe you should have access to this agreement, please contact the administrator or the person who shared this link with you.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <button 
                className="text-primary hover:underline text-sm"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </button>
              <button 
                className="text-primary hover:underline text-sm"
                onClick={() => navigate('/my-agreements')}
              >
                My Agreements
              </button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }
  
  if (!agreement) {
    return <NotFoundState />;
  }
  
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
        navigate('/dashboard');
      } else {
        await requestDeleteAgreement(id);
        // Update the local agreement state after delete request
        const updatedAgreement = getAgreementById(id);
        if (updatedAgreement) {
          setAgreement(updatedAgreement);
        } else {
          // Agreement was fully deleted
          setNotFound(true);
        }
      }
    } catch (error) {
      console.error("Error requesting deletion:", error);
      toast.error("Failed to request deletion. Please try again.");
    }
  };
  
  return (
    <Layout>
      <div className="min-h-[80vh] max-w-2xl mx-auto animate-fade-in">
        <Card className="glass-card animate-scale-in overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex justify-between items-center">
              <AgreementHeader status={agreement.status} />
              {isAdmin && (
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                  <Shield className="h-3 w-3" />
                  Admin View
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="mb-6">
              <AgreementParties 
                creatorName={agreement.creatorName}
                recipientName={agreement.recipientName}
                createdAt={agreement.createdAt}
              />
              
              <AgreementMessage message={agreement.message} />
            </div>
            
            {!isAuthenticated && agreement.status === 'pending' && (
              <LoginPrompt />
            )}
          </CardContent>
          
          <CardFooter className="p-0">
            <AgreementActions
              id={agreement.id}
              status={agreement.status}
              canRespond={canRespond}
              canDelete={canDelete}
              isResponding={isResponding}
              isCreator={isCreator}
              hasRequestedDelete={hasRequestedDelete}
              onResponse={handleResponse}
              onRequestDelete={handleRequestDelete}
              isAdmin={isAdmin}
            />
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default AgreementDetail;
