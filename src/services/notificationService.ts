import axios from 'axios';
import { API_URL } from '@/config';

export interface Notification {
  id: string;
  type: 'system' | 'business';
  severity: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  business_id?: string;
  subscription_id?: string;
}

export class NotificationService {
  private static _instance: NotificationService;
  private readonly api: any;

  private constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/api/notifications/`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add authentication interceptor
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  public static getInstance(): NotificationService {
    if (!NotificationService._instance) {
      NotificationService._instance = new NotificationService();
    }
    return NotificationService._instance;
  }

  async getNotifications(): Promise<Notification[]> {
    const response = await this.api.get('');
    return response.data;
  }

  async getBusinessNotifications(businessId: string): Promise<Notification[]> {
    const response = await this.api.get(`business/${businessId}/`);
    return response.data;
  }

  async createNotification(data: {
    type: 'system' | 'business';
    severity: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    business_id?: string;
    subscription_id?: string;
  }): Promise<Notification> {
    const response = await this.api.post('', data);
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.api.patch(`${notificationId}/mark-as-read/`);
  }

  async markAllAsRead(): Promise<void> {
    await this.api.post('mark-all-as-read/');
  }

  async getUnreadCount(): Promise<number> {
    const response = await this.api.get('unread-count/');
    return response.data.count;
  }

  async getBusinessUnreadCount(businessId: string): Promise<number> {
    const response = await this.api.get(`business/${businessId}/unread-count/`);
    return response.data.count;
  }
}
