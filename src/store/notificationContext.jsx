import { useCallback, useEffect, useMemo, useState } from 'react';
import dashboardService from '../services/dashboard.service';
import useUserContext from '../hooks/useUserContext';
import { NotificationContext } from './notificationContextStore';

const POLL_INTERVAL_MS = 60000;

const NotificationProvider = ({ children }) => {
  const { user, loading: userLoading } = useUserContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const syncUnreadCount = useCallback((count) => {
    const normalized = Number.isFinite(Number(count)) ? Number(count) : 0;
    setUnreadCount(Math.max(0, normalized));
  }, []);

  const decrementUnreadCount = useCallback((amount = 1) => {
    const delta = Number.isFinite(Number(amount)) ? Number(amount) : 1;
    setUnreadCount((prev) => Math.max(0, prev - Math.max(0, delta)));
  }, []);

  const clearUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    if (!user?._id && !user?.id) {
      setUnreadCount(0);
      return false;
    }

    try {
      setLoading(true);
      const res = await dashboardService.getNotifications();
      if (!res?.success) return false;

      const list = Array.isArray(res?.data?.notifications) ? res.data.notifications : [];
      const unread = list.reduce((total, item) => total + (item?.read ? 0 : 1), 0);
      setUnreadCount(unread);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?._id, user?.id]);

  useEffect(() => {
    if (userLoading) return;

    if (!user?._id && !user?.id) {
      setUnreadCount(0);
      return;
    }

    refreshUnreadCount();

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshUnreadCount();
      }
    };

    const intervalId = window.setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    window.addEventListener('focus', refreshUnreadCount);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshUnreadCount);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshUnreadCount, user?._id, user?.id, userLoading]);

  const values = useMemo(
    () => ({
      unreadCount,
      loading,
      refreshUnreadCount,
      syncUnreadCount,
      decrementUnreadCount,
      clearUnreadCount,
    }),
    [clearUnreadCount, decrementUnreadCount, loading, refreshUnreadCount, syncUnreadCount, unreadCount]
  );

  return <NotificationContext.Provider value={values}>{children}</NotificationContext.Provider>;
};

export default NotificationProvider;
