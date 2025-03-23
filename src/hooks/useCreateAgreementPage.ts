
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { verifyAgreementExists } from '@/utils/agreementStorage';
import { useAgreementCreation } from '@/hooks/useAgreementCreation';

export const useCreateAgreementPage = () => {
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const { 
    createAgreement, 
    loading, 
    error, 
    agreementId, 
    shareLink, 
    clearState 
  } = useAgreementCreation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to create an agreement');
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

  const copyToClipboard = () => {
    try {
      if (shareLink) {
        navigator.clipboard.writeText(shareLink);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link to clipboard');
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
    loading,
    error,
    agreementId,
    shareLink,
    clearState,
    handleCreateAnother,
    copyToClipboard
  };
};
