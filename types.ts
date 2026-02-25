
export interface CurrencyRate {
  id: string;
  name: string;
  code: string;
  symbol: string;
  buy: number;
  sell: number;
  change24h?: number;
  lastUpdated: string;
  change: 'up' | 'down' | 'neutral';
  flag: string;
  category: 'local' | 'transfer' | 'toman' | 'global';
}

export interface MetalRate {
  id: string;
  name: string;
  code: string;
  unit: string;
  buy: number;
  sell: number;
  change24h?: number;
  lastUpdated: string;
  change: 'up' | 'down' | 'neutral';
  icon?: string;
  category: 'gold' | 'silver' | 'global';
}

export interface Headline {
  id: string;
  text: string;
  date: string;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user' | 'developer' | 'staff' | 'VIP' | 'VIP+' | 'kargeri' | 'editor';
  status: 'pending' | 'approved' | 'blocked';
  createdAt: string;
  expiresAt?: string; // ISO date string for expiration
  avatar?: string; // Add this line
}

export interface CryptoRate {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: string;
  icon: string;
}

export interface AppConfig {
  appName: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  borderRadius: number;
  fontSize: number;
  fontFamily: string;
  layoutMode: 'table' | 'grid';
  notificationsEnabled: boolean;
  translations: Record<string, Record<string, string>>;
  enabledTabs?: string[];
  tabNames?: Record<string, string>;
  tabIcons?: Record<string, string>;
  ledgerTitle?: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  image?: string;
  defaultPrice: number; // Selling Price
  costPrice?: number;
  quantity?: number;
  barcode?: string;
  wholesalePrice?: number;
  expiryDate?: string;
  socialLink?: string;
  note?: string;
  category?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'buy' | 'sell' | 'expense' | 'rent';
  itemName: string;
  image?: string; // Base64 or URL for product image
  amount: number;
  price: number;
  total: number;
  profit?: number; // Manual profit/loss entry
  date: string;
  note?: string;
  customerName?: string;
  status?: 'paid' | 'pending'; // pending = Qarz
  dueDate?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system' | 'paper';
export type LanguageCode = 'ku' | 'ar' | 'en';
export type ViewMode = 'market' | 'metals' | 'crypto' | 'admin' | 'converter' | 'settings' | 'developer' | 'favorites' | 'kargeri' | 'editor' | 'accounts';
