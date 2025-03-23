
import { useCallback } from 'react';
import { Agreement } from '@/types/agreement';
import { getStoredAgreements } from '@/utils/agreementStorage';
import { fetchUserAgreements } from '@/utils/supabaseAgreementUtils';
import { toast } from '@/lib/toast';

export const useAgreementLoader = (
  userId: string | undefined,
  setAgreements: React.Dispatch<React.SetStateAction<Agreement[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const loadAgreements = useCallback(async () => {
    try {
      console.log("Loading agreements...");
      setLoading(true);
      
      // Get agreements from localStorage for backward compatibility
      const storedAgreements = getStoredAgreements();
      console.log("Loaded agreements from localStorage:", storedAgreements.length);
      
      // If user is logged in, also fetch from Supabase
      if (userId) {
        console.log(`Fetching agreements for user ${userId} from Supabase`);
        const supabaseAgreements = await fetchUserAgreements(userId);
        console.log(`Fetched ${supabaseAgreements.length} agreements from Supabase`);
        
        // Merge agreements, preferring Supabase data for duplicates
        const mergedAgreements = [...storedAgreements];
        
        for (const supabaseAgreement of supabaseAgreements) {
          const existingIndex = mergedAgreements.findIndex(a => a.id === supabaseAgreement.id);
          if (existingIndex >= 0) {
            // Update existing agreement with Supabase data
            mergedAgreements[existingIndex] = supabaseAgreement;
          } else {
            // Add new agreement from Supabase
            mergedAgreements.push(supabaseAgreement);
          }
        }
        
        setAgreements(mergedAgreements);
      } else {
        // Just use localStorage data if no user is logged in
        setAgreements(storedAgreements);
      }
    } catch (error) {
      console.error("Error loading agreements:", error);
      toast.error("Failed to load agreements. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [userId, setAgreements, setLoading]);

  return { loadAgreements };
};
