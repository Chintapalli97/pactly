
import { useState, useEffect } from 'react';
import { 
  hasNewNotifications as checkForNotifications, 
  updateNotifications
} from '@/utils/agreementUtils';

export const useAgreementNotifications = (userId: string | undefined) => {
  const [hasNotifications, setHasNotifications] = useState(false);
  
  useEffect(() => {
    if (userId) {
      setHasNotifications(checkForNotifications(userId));
    }
  }, [userId]);
  
  const clearNotifications = () => {
    if (userId) {
      updateNotifications(userId, false);
      setHasNotifications(false);
    }
  };
  
  return { hasNewNotifications: hasNotifications, clearNotifications };
};
