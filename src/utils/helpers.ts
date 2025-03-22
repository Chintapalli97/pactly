
// Simple utility to simulate API delay for demo purposes
export const simulateApiDelay = async (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 500));
};
