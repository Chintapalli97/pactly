import { ACCESS_LOGS_KEY } from './constants';

export type AccessLogEntry = {
  userId: string;
  userName: string;
  action: string;
  agreementId?: string;
  timestamp: string;
  success: boolean;
  details?: string;
  error?: string;
};

export const logAccessAttempt = (entry: AccessLogEntry): void => {
  try {
    const logs = JSON.parse(localStorage.getItem(ACCESS_LOGS_KEY) || '[]');
    logs.push(entry);
    
    // Keep only the last 1000 log entries to prevent localStorage from getting too large
    const trimmedLogs = logs.slice(-1000);
    
    localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify(trimmedLogs));
    console.log('Access log entry recorded:', entry);
  } catch (error) {
    console.error('Error logging access attempt:', error);
  }
};

export const getAccessLogs = (): AccessLogEntry[] => {
  try {
    const logs = JSON.parse(localStorage.getItem(ACCESS_LOGS_KEY) || '[]');
    return logs;
  } catch (error) {
    console.error('Error retrieving access logs:', error);
    return [];
  }
};

export const clearAccessLogs = (): void => {
  try {
    localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify([]));
    console.log('Access logs cleared');
  } catch (error) {
    console.error('Error clearing access logs:', error);
  }
};
