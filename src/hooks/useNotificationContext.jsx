import { useContext } from 'react';
import { NotificationContext } from '../store/notificationContextStore';

const useNotificationContext = () => {
  const notificationContext = useContext(NotificationContext);
  return notificationContext;
};

export default useNotificationContext;
