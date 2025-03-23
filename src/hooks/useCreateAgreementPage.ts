
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { verifyAgreementExists } from '@/utils/agreementStorage';
import { useAgreementCreation } from '@/hooks/useAgreementCreation';
import { supabase } from '@/integrations/supabase/client';

export const useCreateAgreementPage = () => {
  const [message, setMessage] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    createAgreement, 
    loading, 
    error, 
    agreementId, 
    shareLink, 
    clearState 
  } = useAgreementCreation();

  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsCheckingAuth(true);
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth status:', error);
        }
        
        console.log('Auth check completed:', data.session ? 'Authenticated' : 'Not authenticated');
        
        if (!data.session && !user) {
          console.log('No active session and no user, redirecting to login');
          toast.error('You must be logged in to create an agreement');
          navigate('/login');
        }
      } catch (err) {
        console.error('Error during auth check:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuthStatus();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }
    
    // Double-check authentication before proceeding
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!user && !sessionData.session) {
      toast.error('You must be logged in to create an agreement');
      navigate('/login');
      return;
    }
    
    try {
      const id = await createAgreement(message);
      
      if (!id) {
        throw new Error('Failed to create agreement');
      }
      
      // Verify that the agreement was created and exists
      if (!verifyAgreementExists(id)) {
        console.warn('Agreement creation succeeded but agreement not found in storage');
      }
      
      // Trigger a storage event to ensure other components update
      const event = new Event('agreementsUpdated');
      document.dispatchEvent(event);
      
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to create agreement');
    }
  };

  const handleCreateAnother = () => {
    setMessage('');
    clearState();
  };

  return {
    message,
    setMessage,
    handleSubmit,
    loading: loading || isCheckingAuth,
    error,
    agreementId,
    shareLink,
    clearState,
    handleCreateAnother
  };
};
