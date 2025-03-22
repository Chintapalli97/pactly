
// Re-export everything from the refactored utility files
export * from './constants';
export * from './agreementStorage';
export * from './notificationUtils';
export * from './accessLogUtils';
export * from './helpers';

// Add a utility function to simulate API delay
export const simulateApiDelay = async (): Promise<void> => {
  const delayTime = 500 + Math.random() * 1000; // Random delay between 500ms and 1500ms
  return new Promise(resolve => setTimeout(resolve, delayTime));
};
