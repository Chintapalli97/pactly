
import { Agreement, AgreementStatus } from '@/types/agreement';
import { toast } from '@/lib/toast';

export const AGREEMENTS_STORAGE_KEY = 'pact_pal_agreements';
export const NOTIFICATIONS_KEY = 'pact_pal_notifications';

export const getStoredAgreements = (): Agreement[] => {
  try {
    const storedData = localStorage.getItem(AGREEMENTS_STORAGE_KEY);
    if (!storedData) {
      // Initialize empty array if no data exists
      localStorage.setItem(AGREEMENTS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    
    // Parse the stored agreements and validate
    const agreements = JSON.parse(storedData);
    return Array.isArray(agreements) ? agreements : [];
  } catch (error) {
    console.error('Error retrieving agreements:', error);
    // Reset storage if corrupted
    localStorage.setItem(AGREEMENTS_STORAGE_KEY, JSON.stringify([]));
    return [];
  }
};

export const saveAgreements = (agreements: Agreement[]): void => {
  try {
    localStorage.setItem(AGREEMENTS_STORAGE_KEY, JSON.stringify(agreements));
    // Dispatch storage event for cross-tab communication
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error saving agreements:', error);
    toast.error('Failed to save agreement data');
  }
};

export const getAgreementById = (id: string): Agreement | undefined => {
  if (!id) return undefined;
  
  try {
    // Get all agreements from storage
    const agreements = getStoredAgreements();
    
    // Search for the agreement with the matching ID
    const agreement = agreements.find(agreement => agreement.id === id);
    
    if (agreement) {
      console.log(`Found agreement with ID ${id}:`, agreement);
    } else {
      console.log(`No agreement found with ID ${id}`);
    }
    
    return agreement;
  } catch (error) {
    console.error(`Error retrieving agreement ${id}:`, error);
    return undefined;
  }
};

export const hasNewNotifications = (userId: string | undefined): boolean => {
  if (!userId) return false;
  
  const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
  return !!notifications[userId];
};

export const updateNotifications = (userId: string, hasNotification: boolean): void => {
  if (!userId) return;
  
  const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
  notifications[userId] = hasNotification;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

export const addNotificationForUser = (userId: string): void => {
  const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
  notifications[userId] = true;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

export const simulateApiDelay = async (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 500));
};

// Utility to verify if an agreement exists in storage
export const verifyAgreementExists = (id: string): boolean => {
  return !!getAgreementById(id);
};
