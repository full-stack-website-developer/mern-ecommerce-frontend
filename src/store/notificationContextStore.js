import { createContext } from 'react';

export const NotificationContext = createContext({
  unreadCount: 0,
  loading: false,
  refreshUnreadCount: async () => false,
  syncUnreadCount: () => {},
  decrementUnreadCount: () => {},
  clearUnreadCount: () => {},
});
