import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRepositories } from '../../infrastructure/config';
import { t } from '../i18n';

export interface NotificationItem {
  id: string;
  type: 'low_stock' | 'weekly_report' | 'system';
  title: string;
  description: string;
  isRead: boolean;
  createdAt: Date;
  link?: string;
}

export const useNotifications = () => {
  const { currentOrganization, currentShop } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!currentOrganization || !currentShop) return;
      const repos = getRepositories();
      const notifs: NotificationItem[] = [];

      // 1. Low Stock Notifications
      const inventory = await repos.inventory.findAllByShop(currentOrganization.id, currentShop.id);
      const lowStockItems = inventory.filter(i => i.lowStockThreshold !== undefined && i.quantity <= i.lowStockThreshold);

      for (const item of lowStockItems) {
        const product = await repos.products.findById(currentOrganization.id, item.productId);
        if (product) {
          notifs.push({
            id: `low_stock_${item.id}`,
            type: 'low_stock',
            title: t('notifications.lowStockTitle'),
            description: t('notifications.lowStockDesc', { productName: product.name, quantity: item.quantity }),
            isRead: false,
            createdAt: new Date(),
            link: '/app/inventory'
          });
        }
      }

      // 2. Weekly Sales Report (Mock)
      const recentSales = await repos.sales.findRecent(currentOrganization.id, currentShop.id, 100);
      if (recentSales.length > 0) {
        const totalRevenue = recentSales.reduce((sum, s) => sum + (s.total || 0), 0);
        notifs.push({
          id: `weekly_report_${new Date().getTime()}`,
          type: 'weekly_report',
          title: t('notifications.weeklyReportTitle'),
          description: t('notifications.weeklyReportDesc', { revenue: totalRevenue }),
          isRead: false,
          createdAt: new Date(),
        });
      }

      setNotifications(notifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setUnreadCount(notifs.filter(n => !n.isRead).length);
    };

    loadNotifications();
    
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [currentOrganization, currentShop]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const newNotifs = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      setUnreadCount(newNotifs.filter(n => !n.isRead).length);
      return newNotifs;
    });
  };

  return { notifications, unreadCount, markAllAsRead, markAsRead };
};
