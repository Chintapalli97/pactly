export const AGREEMENTS_KEY = 'pact_pal_agreements';
export const AGREEMENTS_UPDATED_EVENT = 'agreementsUpdated';

// Function to simulate API delay (for demo purposes)
export const simulateApiDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Add this new constant
export const ACCESS_LOGS_KEY = 'pact_pal_access_logs';
