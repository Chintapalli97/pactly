
import { NOTIFICATIONS_KEY } from './constants';

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
