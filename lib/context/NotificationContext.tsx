'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { requestNotificationPermission, subscribeToPushNotifications, sendSubscriptionToServer } from '@/lib/notifications/push-utils';

interface NotificationContextType {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
  requestPermission: () => Promise<boolean>;
  subscribe: (userId: string) => Promise<boolean>;
  sendNotification: (message: string, excludeUserId?: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window !== 'undefined') {
      setIsSupported('Notification' in window && 'serviceWorker' in navigator);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    setPermission(Notification.permission);
    return granted;
  };

  const subscribe = async (userId: string): Promise<boolean> => {
    try {
      const subscription = await subscribeToPushNotifications();
      if (subscription) {
        await sendSubscriptionToServer(subscription, userId);
        setIsSubscribed(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
      return false;
    }
  };

  const sendNotification = async (message: string, excludeUserId?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          excludeUserId
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  };

  return (
    <NotificationContext.Provider value={{
      isSupported,
      permission,
      isSubscribed,
      requestPermission,
      subscribe,
      sendNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}