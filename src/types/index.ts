export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'tea' | 'snacks' | 'extras';
  isAvailable: boolean;
  isTodaySpecial: boolean;
  discount?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  tableNumber: number;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: Date;
  notes?: string;
}

export interface ShopSettings {
  name: string;
  description: string;
  isOpen: boolean;
  numberOfTables: number;
  soundAlerts: boolean;
  browserNotifications: boolean;
}
