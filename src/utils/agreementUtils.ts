
// Re-export everything from the refactored utility files
export * from './constants';
export * from './agreementStorage';
export * from './notificationUtils';
export * from './accessLogUtils';
export * from './helpers';

// Import the specific constants and functions we need
import { AGREEMENTS_KEY } from './constants';
import { getStoredAgreements } from './agreementStorage';

// Add a utility function to simulate API delay
export const simulateApiDelay = async (): Promise<void> => {
  const delayTime = 500 + Math.random() * 1000; // Random delay between 500ms and 1500ms
  return new Promise(resolve => setTimeout(resolve, delayTime));
};

// Add these new functions for the admin dashboard

// Function to get access logs (re-exporting from accessLogUtils for consistency)
export { getAccessLogs, clearAccessLogs } from './accessLogUtils';
export type { AccessLogEntry } from './accessLogUtils';

// Function to clear all agreements (admin only)
export const clearAllAgreements = (): void => {
  try {
    localStorage.setItem(AGREEMENTS_KEY, JSON.stringify([]));
    console.log('All agreements cleared');
    
    // Trigger a storage event to ensure other components update
    const event = new Event('agreementsUpdated');
    document.dispatchEvent(event);
  } catch (error) {
    console.error('Error clearing all agreements:', error);
  }
};

// Function to restore a deleted agreement (admin only)
export const restoreAgreement = (agreementId: string): boolean => {
  try {
    const agreements = getStoredAgreements();
    const agreementIndex = agreements.findIndex(agreement => agreement.id === agreementId);
    
    if (agreementIndex === -1) {
      console.error(`Agreement with ID ${agreementId} not found`);
      return false;
    }
    
    // Update the agreement to mark it as not deleted
    agreements[agreementIndex].isDeleted = false;
    
    // Save the updated agreements back to storage
    localStorage.setItem(AGREEMENTS_KEY, JSON.stringify(agreements));
    console.log(`Agreement ${agreementId} restored`);
    
    // Trigger a storage event to ensure other components update
    const event = new Event('agreementsUpdated');
    document.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error(`Error restoring agreement ${agreementId}:`, error);
    return false;
  }
};
