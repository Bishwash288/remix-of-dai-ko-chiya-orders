import { create } from 'zustand';
import { MenuItem, Order, CartItem, ShopSettings } from '@/types';

interface AppState {
  // Menu
  menuItems: MenuItem[];
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  updateCartItemNotes: (id: string, notes: string) => void;
  clearCart: () => void;

  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  addItemToOrder: (orderId: string, item: CartItem) => void;

  // Settings
  settings: ShopSettings;
  updateSettings: (settings: Partial<ShopSettings>) => void;

  // Selected table for customer
  selectedTable: number | null;
  setSelectedTable: (table: number | null) => void;
}

const defaultMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Tea',
    description: 'Milk',
    price: 40,
    category: 'tea',
    isAvailable: true,
    isTodaySpecial: true,
  },
  {
    id: '2',
    name: 'Mandip Chiya',
    description: 'Boka',
    price: 500,
    category: 'tea',
    isAvailable: true,
    isTodaySpecial: false,
  },
  {
    id: '3',
    name: 'momo',
    description: 'Steamed dumplings',
    price: 90,
    originalPrice: 100,
    discount: 10,
    category: 'snacks',
    isAvailable: true,
    isTodaySpecial: true,
  },
];

const defaultSettings: ShopSettings = {
  name: 'Dai Ko Chiya',
  description: 'Welcome! Scan, order, enjoy.',
  isOpen: true,
  numberOfTables: 10,
  soundAlerts: true,
  browserNotifications: false,
};

export const useStore = create<AppState>((set, get) => ({
  // Menu
  menuItems: defaultMenuItems,
  addMenuItem: (item) => set((state) => ({ menuItems: [...state.menuItems, item] })),
  updateMenuItem: (id, updates) =>
    set((state) => ({
      menuItems: state.menuItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
  deleteMenuItem: (id) =>
    set((state) => ({
      menuItems: state.menuItems.filter((item) => item.id !== id),
    })),

  // Cart
  cart: [],
  addToCart: (item) =>
    set((state) => {
      const existingItem = state.cart.find((i) => i.id === item.id);
      if (existingItem) {
        return {
          cart: state.cart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { cart: [...state.cart, { ...item, quantity: 1 }] };
    }),
  removeFromCart: (id) =>
    set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),
  updateCartItemQuantity: (id, quantity) =>
    set((state) => ({
      cart:
        quantity <= 0
          ? state.cart.filter((item) => item.id !== id)
          : state.cart.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
    })),
  updateCartItemNotes: (id, notes) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id ? { ...item, notes } : item
      ),
    })),
  clearCart: () => set({ cart: [] }),

  // Orders
  orders: [
    {
      id: '1',
      orderNumber: 1,
      tableNumber: 1,
      items: [{ ...defaultMenuItems[0], quantity: 3, notes: 'Less sugar' }],
      total: 120,
      status: 'preparing',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      id: '2',
      orderNumber: 2,
      tableNumber: 2,
      items: [{ ...defaultMenuItems[1], quantity: 1 }],
      total: 500,
      status: 'ready',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  ],
  addOrder: (order) =>
    set((state) => {
      const newOrder: Order = {
        ...order,
        id: crypto.randomUUID(),
        orderNumber: state.orders.length + 1,
        createdAt: new Date(),
      };
      return { orders: [newOrder, ...state.orders] };
    }),
  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, status } : order
      ),
    })),
  addItemToOrder: (orderId, item) =>
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId) return order;
        const existingItem = order.items.find((i) => i.id === item.id);
        if (existingItem) {
          return {
            ...order,
            items: order.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
            total: order.total + item.price * item.quantity,
          };
        }
        return {
          ...order,
          items: [...order.items, item],
          total: order.total + item.price * item.quantity,
        };
      }),
    })),

  // Settings
  settings: defaultSettings,
  updateSettings: (updates) =>
    set((state) => ({ settings: { ...state.settings, ...updates } })),

  // Selected table
  selectedTable: null,
  setSelectedTable: (table) => set({ selectedTable: table }),
}));
