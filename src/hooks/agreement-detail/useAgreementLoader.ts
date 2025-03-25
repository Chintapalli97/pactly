
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAgreements } from '@/hooks/useAgreementsContext';
import { Agreement, AgreementDB, mapDBAgreementToAgreement } from '@/types/agreement';
import { toast } from '@/lib/toast';
import { 
  getAgreementById as getAgreementByIdUtil,
  ensureAgreementInStorage
} from '@/utils/agreementUtils';
import { fetchAgreementById } from '@/utils/supabaseAgreementUtils';
import { supabase } from '@/integrations/supabase/client';

export const useAgreementLoader = (id: string | undefined) => {
  const { user } = useAuth();
  const { getAgreementById } = useAgreements();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  const loadAgreement = async () => {
    if (!id) {
      console.log("No agreement ID provided in URL");
      setNotFound(true);
      setLocalLoading(false);
      return;
    }

    console.log("Loading agreement with ID:", id);
    setLocalLoading(true);

    try {
      // Try to find agreement in context first
      let foundAgreement = getAgreementById(id);
      
      // If not found in context, try to fetch from Supabase directly
      if (!foundAgreement) {
        console.log("Agreement not found in context, trying to fetch from Supabase directly");
        
        const { data, error } = await supabase
          .from('agreements')
          .select('*')
          .eq('id', id)
          .eq('is_deleted', false)
          .single();
          
        if (error) {
          console.error("Error fetching agreement from Supabase:", error);
        } else if (data) {
          console.log("Agreement found in Supabase:", data);
          
          // Convert from database format to application format
          foundAgreement = {
            id: data.id,
            message: data.message,
            createdAt: data.created_at,
            creatorId: data.creator_id || '',
            creatorName: data.creator_name || 'Anonymous',
            recipientId: data.recipient_id || undefined,
            recipientName: data.recipient_name || undefined,
            status: data.status as any,
            deleteRequestedBy: data.delete_requested_by || [],
            isDeleted: data.is_deleted
          };
          
          // Ensure it's in local storage
          ensureAgreementInStorage(foundAgreement);
        }
      }
      
      if (foundAgreement) {
        console.log('Agreement found:', foundAgreement);
        
        // For pending agreements, anyone can view them (even not logged in users)
        // Also allow viewing of any accepted agreement without login requirement
        setAgreement(foundAgreement);
        document.title = `Agreement | Friendly Agreements`;
        
        // If found but not in localStorage, add it to the context
        if (!getAgreementByIdUtil(id)) {
          console.log('Agreement found but not in localStorage, ensuring it is in storage');
          ensureAgreementInStorage(foundAgreement);
          
          // Trigger a storage event to refresh the agreements in other tabs
          const event = new Event('agreementsUpdated');
          document.dispatchEvent(event);
        }
      } else {
        console.log('Agreement not found with ID:', id);
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error loading agreement:", error);
      setNotFound(true);
      toast.error("Error loading agreement. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    loadAgreement();
    
    // Listen for storage events to reload agreement if it changes in another tab
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'pact_pal_agreements') {
        console.log("Storage event detected, reloading agreement");
        loadAgreement();
      }
    };
    
    // Also listen for custom events from the current tab
    const handleCustomEvent = () => {
      console.log("Custom event detected, reloading agreement");
      loadAgreement();
    };
    
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('agreementsUpdated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('agreementsUpdated', handleCustomEvent);
    };
  }, [id, user]);

  return {
    agreement,
    notFound,
    accessDenied,
    localLoading,
    setAgreement
  };
};
