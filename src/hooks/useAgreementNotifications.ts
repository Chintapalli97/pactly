
import { useState, useEffect } from 'react';
import { 
  hasNewNotifications as checkForNotifications, 
  updateNotifications
} from '@/utils/agreementUtils';

export const useAgreementNotifications = (userId: string | undefined) => {
  const [hasNotifications, setHasNotifications] = useState(false);
  
  useEffect(() => {
    const checkNotifications = () => {
      if (userId) {
        try {
          const hasNew = checkForNotifications(userId);
          console.log(`Checking notifications for user ${userId}:`, hasNew ? 'Has notifications' : 'No notifications');
          setHasNotifications(hasNew);
        } catch (error) {
          console.error("Error checking notifications:", error);
          setHasNotifications(false);
        }
      } else {
        setHasNotifications(false);
      }
    };
    
    // Check notifications immediately
    checkNotifications();
    
    // Set up event listener for notifications changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'pact_pal_notifications') {
        console.log("Notifications storage changed, rechecking");
        checkNotifications();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Set up an interval to check for notifications periodically
    const intervalId = setInterval(checkNotifications, 30000); // Check every 30 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
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
