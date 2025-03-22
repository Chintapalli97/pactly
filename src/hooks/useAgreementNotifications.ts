
import { useState, useEffect } from 'react';
import { 
  hasNewNotifications as checkForNotifications, 
  updateNotifications
} from '@/utils/agreementUtils';

export const useAgreementNotifications = (userId: string | undefined) => {
  const [hasNotifications, setHasNotifications] = useState(false);
  
  useEffect(() => {
    if (userId) {
      const hasNew = checkForNotifications(userId);
      console.log(`Checking notifications for user ${userId}:`, hasNew ? 'Has notifications' : 'No notifications');
      setHasNotifications(hasNew);
    }
    
    // Set up event listener for notifications changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'pact_pal_notifications' && userId) {
        console.log("Notifications storage changed, rechecking");
        setHasNotifications(checkForNotifications(userId));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userId]);
  
  const clearNotifications = () => {
    if (userId) {
      console.log(`Clearing notifications for user ${userId}`);
      updateNotifications(userId, false);
      setHasNotifications(false);
    }
  };
  
  return { hasNewNotifications: hasNotifications, clearNotifications };
};
