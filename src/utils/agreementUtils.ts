
import { Agreement } from '@/types/agreement';
import { toast } from '@/lib/toast';

export const AGREEMENTS_STORAGE_KEY = 'pact_pal_agreements';
export const NOTIFICATIONS_KEY = 'pact_pal_notifications';

export const getStoredAgreements = (): Agreement[] => {
  if (!localStorage.getItem(AGREEMENTS_STORAGE_KEY)) {
    localStorage.setItem(AGREEMENTS_STORAGE_KEY, JSON.stringify([]));
  }
  
  return JSON.parse(localStorage.getItem(AGREEMENTS_STORAGE_KEY) || '[]');
};

export const saveAgreements = (agreements: Agreement[]): void => {
  localStorage.setItem(AGREEMENTS_STORAGE_KEY, JSON.stringify(agreements));
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
