export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: 'admin' | 'manager' | 'staff' | 'customer' | 'driver';
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  metadata?: Record<string, any>;
  billingAddress?: Address;
  shippingAddress?: Address;
  preferences?: UserPreferences;
  permissions?: string[];
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  type?: 'billing' | 'shipping' | 'both';
}

export interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  marketingEmails: boolean;
}
