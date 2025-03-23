
import supabase from './supabase';
import { Agreement, AgreementDB, mapDBAgreementToAgreement, mapAgreementToDBFormat } from '@/types/agreement';
import { ensureAgreementInStorage } from './agreementStorage';
import { simulateApiDelay } from './agreementUtils';

// Fetch agreement by ID from Supabase
export async function fetchAgreementById(id: string): Promise<Agreement | null> {
  try {
    console.log(`Fetching agreement with ID ${id} from Supabase`);
    
    const { data, error } = await supabase
      .from('agreements')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();
    
    if (error) {
      console.error('Error fetching agreement from Supabase:', error);
      return null;
    }
    
    if (!data) {
      console.log(`No agreement found with ID ${id} in Supabase`);
      return null;
    }
    
    const agreement = mapDBAgreementToAgreement(data as AgreementDB);
    console.log('Successfully fetched agreement from Supabase:', agreement);
    
    // Also ensure it's in localStorage for backward compatibility
    ensureAgreementInStorage(agreement);
    
    return agreement;
  } catch (error) {
    console.error(`Error retrieving agreement ${id} from Supabase:`, error);
    return null;
  }
}

// Create a new agreement in Supabase
export async function createAgreementInSupabase(agreement: Agreement): Promise<string | null> {
  try {
    console.log('Creating new agreement in Supabase:', agreement);
    
    // Convert the agreement to the DB format with required fields
    const dbAgreement = mapAgreementToDBFormat(agreement);
    
    // Make sure required fields are present
    if (!dbAgreement.message) {
      console.error('Agreement message is required');
      throw new Error('Agreement message is required');
    }
    
    const { data, error } = await supabase
      .from('agreements')
      .insert(dbAgreement)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating agreement in Supabase:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data returned from agreement creation');
      throw new Error('No data returned from agreement creation');
    }
    
    console.log('Successfully created agreement in Supabase:', data);
    return data.id;
  } catch (error) {
    console.error('Error creating agreement in Supabase:', error);
    throw error;
  }
}

// Update an agreement in Supabase
export async function updateAgreementInSupabase(agreement: Agreement): Promise<boolean> {
  try {
    console.log('Updating agreement in Supabase:', agreement);
    
    // Convert the agreement to the DB format with all required fields
    const dbAgreement = mapAgreementToDBFormat(agreement);
    
    const { error } = await supabase
      .from('agreements')
      .update(dbAgreement)
      .eq('id', agreement.id);
    
    if (error) {
      console.error('Error updating agreement in Supabase:', error);
      return false;
    }
    
    console.log('Successfully updated agreement in Supabase');
    return true;
  } catch (error) {
    console.error('Error updating agreement in Supabase:', error);
    return false;
  }
}

// Soft delete an agreement by marking it as deleted
export async function softDeleteAgreementInSupabase(id: string): Promise<boolean> {
  try {
    console.log(`Soft deleting agreement with ID ${id} in Supabase`);
    
    const { error } = await supabase
      .from('agreements')
      .update({ is_deleted: true })
      .eq('id', id);
    
    if (error) {
      console.error('Error soft deleting agreement in Supabase:', error);
      return false;
    }
    
    console.log('Successfully soft deleted agreement in Supabase');
    return true;
  } catch (error) {
    console.error('Error soft deleting agreement in Supabase:', error);
    return false;
  }
}

// Fetch all agreements for a user
export async function fetchUserAgreements(userId: string): Promise<Agreement[]> {
  try {
    console.log(`Fetching agreements for user ${userId} from Supabase`);
    
    const { data, error } = await supabase
      .from('agreements')
      .select('*')
      .or(`creator_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('is_deleted', false);
    
    if (error) {
      console.error('Error fetching user agreements from Supabase:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`No agreements found for user ${userId} in Supabase`);
      return [];
    }
    
    const agreements = data.map(item => mapDBAgreementToAgreement(item as AgreementDB));
    console.log(`Successfully fetched ${agreements.length} agreements for user ${userId}`);
    
    return agreements;
  } catch (error) {
    console.error(`Error retrieving agreements for user ${userId} from Supabase:`, error);
    return [];
  }
}

// Compatibility layer - simulates API delay for consistent user experience
export async function withApiDelay<T>(fn: () => Promise<T>): Promise<T> {
  await simulateApiDelay();
  return fn();
}
