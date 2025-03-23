
import { useState } from 'react';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';
import { logAccessAttempt } from '@/utils/agreementUtils';

export const useAgreementCreation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreementId, setAgreementId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const createAgreement = async (message: string): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Starting agreement creation process');
      const { data: userData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !userData.user) {
        console.error('Authentication error:', authError);
        throw new Error('You must be logged in to create an agreement');
      }

      const creatorId = userData.user.id;
      const creatorName = userData.user.user_metadata?.name || 'Anonymous';
      
      console.log(`Creating agreement for user ${creatorId} (${creatorName})`);
      
      const agreementData = {
        message,
        creator_id: creatorId,
        creator_name: creatorName,
        status: 'pending',
        is_deleted: false,
        delete_requested_by: []
      };

      const { data, error: insertError } = await supabase
        .from('agreements')
        .insert(agreementData)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting agreement:', insertError);
        throw insertError;
      }

      if (!data || !data.id) {
        console.error('No data returned from insert operation');
        throw new Error('Failed to create agreement - no ID returned');
      }

      const newAgreementId = data.id;
      setAgreementId(newAgreementId);
      
      // Always generate production URL for sharing
      const productionUrl = 'https://playful-pact-pal.vercel.app';
      const link = `${productionUrl}/agreements/${newAgreementId}`;
      setShareLink(link);
      
      console.log(`Agreement created successfully with ID: ${newAgreementId}`);
      console.log(`Share link: ${link}`);
      
      // Log successful creation
      logAccessAttempt({
        userId: creatorId,
        userName: creatorName,
        action: 'create',
        agreementId: newAgreementId,
        timestamp: new Date().toISOString(),
        success: true,
      });
      
      toast.success('Agreement created!');
      return newAgreementId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create agreement';
      setError(errorMessage);
      console.error('Agreement creation failed:', err);
      
      // Log failed attempt if we have user data
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          logAccessAttempt({
            userId: data.user.id,
            userName: data.user.user_metadata?.name || 'Unknown',
            action: 'create',
            timestamp: new Date().toISOString(),
            success: false,
            error: errorMessage,
          });
        }
      } catch (logError) {
        console.error('Error logging access attempt:', logError);
      }
      
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { 
    createAgreement, 
    loading, 
    error, 
    agreementId,
    shareLink,
    clearState: () => {
      setError(null);
      setAgreementId(null);
      setShareLink(null);
    }
  };
};
