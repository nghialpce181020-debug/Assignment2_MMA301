import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const [lastNotification, setLastNotification] = useState(null);

  useEffect(() => {
    // Check initial permission status on startup
    const checkPermission = async () => {
      const res = await notificationService.getStatus();
      setPermissionGranted(res.granted);
      setPermissionStatus(res.status);
    };
    checkPermission();
  }, []);

  const requestPermission = async () => {
    const res = await notificationService.requestPermission();
    setPermissionGranted(res.granted);
    setPermissionStatus(res.status);
    return res;
  };

  const sendOrderNotification = async (order) => {
    const res = await notificationService.notifyOrderPlaced(order);
    if (res.success) {
      setLastNotification({ title: 'Đặt hàng thành công', time: new Date() });
    }
    return res;
  };

  const sendWishlistNotification = async (product) => {
    const res = await notificationService.notifyWishlistAdded(product);
    if (res.success) {
      setLastNotification({ title: 'Thêm vào yêu thích', time: new Date() });
    }
    return res;
  };

  const sendTestNotification = async () => {
    const res = await notificationService.notifyTest();
    if (res.success) {
      setLastNotification({ title: 'Thông báo thử nghiệm', time: new Date() });
    }
    return res;
  };

  return (
    <NotificationContext.Provider
      value={{
        permissionGranted,
        permissionStatus,
        lastNotification,
        requestPermission,
        sendOrderNotification,
        sendWishlistNotification,
        sendTestNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
