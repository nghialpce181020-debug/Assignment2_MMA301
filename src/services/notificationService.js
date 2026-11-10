/**
 * Project: MMA301 Assignment 2 - Integrated E-Commerce Mobile App
 * Tác giả: Lê Phước Nghĩa
 * MSSV: CE181020
 * Git Account: nghialpce181020-debug
 * Module / Requirement: R09 - Expo Notifications & Permission Management
 * Ý nghĩa & Mục đích: Quản lý xin quyền thông báo hệ thống, cấu hình Android Notification Channel, và kích hoạt thông báo sự kiện.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification presentation for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  /**
   * Request user permission for push/local notifications
   * @returns {Promise<{ granted: boolean, status: string }>}
   */
  async requestPermission() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('ecommerce-notifications', {
          name: 'E-Commerce Updates',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563EB',
        });
      }

      return {
        granted: finalStatus === 'granted',
        status: finalStatus,
      };
    } catch (error) {
      console.error('[NotificationService.requestPermission] Error:', error.message);
      return {
        granted: false,
        status: 'error',
        error: error.message,
      };
    }
  },

  /**
   * Get current permission status without prompting
   */
  async getStatus() {
    try {
      const permissions = await Notifications.getPermissionsAsync();
      return {
        granted: permissions.granted,
        status: permissions.status,
      };
    } catch (error) {
      console.error('[NotificationService.getStatus] Error:', error.message);
      return {
        granted: false,
        status: 'undetermined',
      };
    }
  },

  /**
   * Send a business notification immediately
   * @param {Object} options
   * @param {string} options.title
   * @param {string} options.body
   * @param {Object} [options.data]
   */
  async triggerNotification({ title, body, data = {} }) {
    try {
      const { granted } = await this.getStatus();
      if (!granted) {
        console.warn('[NotificationService] Notification permission is not granted.');
        return {
          success: false,
          reason: 'permission_denied',
          message: 'Quyền thông báo chưa được cấp',
        };
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          channelId: 'ecommerce-notifications',
        },
        trigger: null, // trigger immediately
      });

      return {
        success: true,
        notificationId: id,
      };
    } catch (error) {
      console.error('[NotificationService.triggerNotification] Error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Business notification: Order Placed Successfully
   */
  async notifyOrderPlaced(order) {
    return this.triggerNotification({
      title: '🎉 Đặt hàng thành công!',
      body: `Đơn hàng #${order.id} trị giá $${order.total.toFixed(2)} đã được xác nhận.`,
      data: { type: 'ORDER_PLACED', orderId: order.id },
    });
  },

  /**
   * Business notification: Product Added to Wishlist
   */
  async notifyWishlistAdded(product) {
    return this.triggerNotification({
      title: '❤️ Đã lưu vào Yêu thích',
      body: `Bạn vừa thêm "${product.title}" vào danh sách yêu thích.`,
      data: { type: 'WISHLIST_ADD', productId: product.id },
    });
  },

  /**
   * Test notification trigger
   */
  async notifyTest() {
    return this.triggerNotification({
      title: '🔔 Thông báo kiểm thử hệ thống',
      body: 'Quyền thông báo hoạt động chính xác theo chuẩn MMA301!',
      data: { type: 'TEST_NOTIFICATION' },
    });
  },
};
