
import { Agreement, AgreementStatus } from '@/types/agreement';
import { toast } from '@/lib/toast';

export const AGREEMENTS_STORAGE_KEY = 'pact_pal_agreements';
export const NOTIFICATIONS_KEY = 'pact_pal_notifications';

export const getStoredAgreements = (): Agreement[] => {
  try {
    const storedData = localStorage.getItem(AGREEMENTS_STORAGE_KEY);
    if (!storedData) {
      // Initialize empty array if no data exists
      console.log("No agreements found in storage, initializing empty array");
      localStorage.setItem(AGREEMENTS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    
    // Parse the stored agreements and validate
    const agreements = JSON.parse(storedData);
    if (!Array.isArray(agreements)) {
      console.error("Stored agreements data is not an array, resetting");
      localStorage.setItem(AGREEMENTS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    
    console.log(`Retrieved ${agreements.length} agreements from storage`);
    return agreements;
  } catch (error) {
    console.error('Error retrieving agreements:', error);
    // Reset storage if corrupted
    localStorage.setItem(AGREEMENTS_STORAGE_KEY, JSON.stringify([]));
    return [];
  }
};

export const saveAgreements = (agreements: Agreement[]): void => {
  try {
    if (!Array.isArray(agreements)) {
      console.error("Cannot save agreements: not an array", agreements);
      return;
    }
    
    console.log(`Saving ${agreements.length} agreements to storage`);
    localStorage.setItem(AGREEMENTS_STORAGE_KEY, JSON.stringify(agreements));
    
    // Dispatch a custom event for the current tab to detect
    const event = new Event('agreementsUpdated');
    document.dispatchEvent(event);
    
    // Since the storage event doesn't fire in the same tab that makes the change,
    // we manually trigger it to ensure consistency across tabs
    try {
      // This will only work in same-origin contexts, which is fine for our app
      window.dispatchEvent(new StorageEvent('storage', {
        key: AGREEMENTS_STORAGE_KEY,
        newValue: JSON.stringify(agreements),
        storageArea: localStorage
      }));
    } catch (e) {
      console.warn("Could not dispatch storage event:", e);
    }
  } catch (error) {
    console.error('Error saving agreements:', error);
    toast.error('Failed to save agreement data');
  }
};

export const getAgreementById = (id: string): Agreement | undefined => {
  if (!id) {
    console.log("No ID provided to getAgreementById");
    return undefined;
  }
  
  try {
    // Get all agreements from storage
    const agreements = getStoredAgreements();
    
    // Search for the agreement with the matching ID
    const agreement = agreements.find(agreement => agreement.id === id);
    
    if (agreement) {
      console.log(`Found agreement with ID ${id}:`, agreement);
    } else {
      console.log(`No agreement found with ID ${id} in localStorage`);
    }
    
    return agreement;
  } catch (error) {
    console.error(`Error retrieving agreement ${id}:`, error);
    return undefined;
  }
};

export const hasNewNotifications = (userId: string | undefined): boolean => {
  if (!userId) return false;
  
  try {
    const storedData = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!storedData) return false;
    
    const notifications = JSON.parse(storedData);
    return !!notifications[userId];
  } catch (error) {
    console.error("Error checking notifications:", error);
    return false;
  }
};

export const updateNotifications = (userId: string, hasNotification: boolean): void => {
  if (!userId) return;
  
  try {
    const storedData = localStorage.getItem(NOTIFICATIONS_KEY) || '{}';
    const notifications = JSON.parse(storedData);
    notifications[userId] = hasNotification;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    
    // Dispatch storage event for cross-tab communication
    window.dispatchEvent(new StorageEvent('storage', {
      key: NOTIFICATIONS_KEY
    }));
  } catch (error) {
    console.error("Error updating notifications:", error);
  }
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
  if (!id) return false;
  
  try {
    const agreement = getAgreementById(id);
    return !!agreement;
  } catch (error) {
    console.error("Error verifying agreement existence:", error);
    return false;
  }
};

// Directly add an agreement to storage if it doesn't exist
export const ensureAgreementInStorage = (agreement: Agreement): void => {
  if (!agreement || !agreement.id) {
    console.error("Invalid agreement provided to ensureAgreementInStorage");
    return;
  }
  
  try {
    const agreements = getStoredAgreements();
    if (!agreements.some(a => a.id === agreement.id)) {
      console.log(`Adding agreement ${agreement.id} to storage`);
      agreements.push(agreement);
      saveAgreements(agreements);
    } else {
      console.log(`Agreement ${agreement.id} already exists in storage`);
    }
  } catch (error) {
    console.error("Error ensuring agreement in storage:", error);
  }
};

// Clear all agreements from storage (for testing/debugging)
export const clearAllAgreements = (): void => {
  try {
    localStorage.setItem(AGREEMENTS_STORAGE_KEY, JSON.stringify([]));
    console.log("All agreements cleared from storage");
    
    // Dispatch events to update UI
    const event = new Event('agreementsUpdated');
    document.dispatchEvent(event);
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: AGREEMENTS_STORAGE_KEY
    }));
  } catch (error) {
    console.error("Error clearing agreements:", error);
  }
};
