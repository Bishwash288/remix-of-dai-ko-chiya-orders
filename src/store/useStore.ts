import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem, Order, CartItem, ShopSettings, DailyAnalytics } from '@/types';

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

  // Customer order tracking
  customerOrderId: string | null;
  setCustomerOrderId: (id: string | null) => void;

  // Settings
  settings: ShopSettings;
  updateSettings: (settings: Partial<ShopSettings>) => void;

  // Selected table for customer
  selectedTable: number | null;
  setSelectedTable: (table: number | null) => void;

  // Analytics history
  analyticsHistory: DailyAnalytics[];
  addDailyAnalytics: (analytics: DailyAnalytics) => void;
  resetDailyStats: () => void;

  // Notifications
  lastOrderCount: number;
  setLastOrderCount: (count: number) => void;
  notificationPermission: NotificationPermission | 'default';
  setNotificationPermission: (permission: NotificationPermission) => void;
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
    isBestSelling: true,
    isLowestPrice: true,
  },
  {
    id: '2',
    name: 'Mandip Chiya',
    description: 'Boka',
    price: 500,
    category: 'tea',
    isAvailable: true,
    isTodaySpecial: false,
    isBestSelling: false,
    isLowestPrice: false,
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
    isBestSelling: false,
    isLowestPrice: false,
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

// Notification sound
const playNotificationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

// Browser notification
const showBrowserNotification = (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  }
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
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
      orders: [],
      addOrder: (order) =>
        set((state) => {
          const newOrder: Order = {
            ...order,
            id: crypto.randomUUID(),
            orderNumber: state.orders.length + 1,
            createdAt: new Date(),
          };

          // Play notification sound
          if (state.settings.soundAlerts) {
            playNotificationSound();
          }

          // Show browser notification
          if (state.settings.browserNotifications) {
            showBrowserNotification(
              '🆕 New Order!',
              `Order #${newOrder.orderNumber} from Table ${newOrder.tableNumber}`
            );
          }

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

      // Customer order tracking
      customerOrderId: null,
      setCustomerOrderId: (id) => set({ customerOrderId: id }),

      // Settings
      settings: defaultSettings,
      updateSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),

      // Selected table
      selectedTable: null,
      setSelectedTable: (table) => set({ selectedTable: table }),

      // Analytics history
      analyticsHistory: [],
      addDailyAnalytics: (analytics) =>
        set((state) => ({
          analyticsHistory: [...state.analyticsHistory, analytics],
        })),
      resetDailyStats: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        // Calculate today's stats
        const todayOrders = state.orders.filter(
          (o) => new Date(o.createdAt).toISOString().split('T')[0] === today
        );
        const completedOrders = todayOrders.filter((o) => o.status === 'completed');
        const revenue = completedOrders.reduce((acc, o) => acc + o.total, 0);

        // Calculate top items
        const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
        todayOrders.forEach((order) => {
          order.items.forEach((item) => {
            if (!itemSales[item.id]) {
              itemSales[item.id] = { name: item.name, quantity: 0, revenue: 0 };
            }
            itemSales[item.id].quantity += item.quantity;
            itemSales[item.id].revenue += item.price * item.quantity;
          });
        });

        const topItems = Object.entries(itemSales)
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);

        // Save to history
        const dailyAnalytics: DailyAnalytics = {
          date: today,
          revenue,
          orders: todayOrders.length,
          completedOrders: completedOrders.length,
          topItems,
        };

        set((state) => ({
          analyticsHistory: [...state.analyticsHistory.filter((a) => a.date !== today), dailyAnalytics],
        }));
      },

      // Notifications
      lastOrderCount: 0,
      setLastOrderCount: (count) => set({ lastOrderCount: count }),
      notificationPermission: 'default',
      setNotificationPermission: (permission) => set({ notificationPermission: permission }),
    }),
    {
      name: 'dai-ko-chiya-store',
      partialize: (state) => ({
        menuItems: state.menuItems,
        orders: state.orders,
        settings: state.settings,
        analyticsHistory: state.analyticsHistory,
        lastOrderCount: state.lastOrderCount,
      }),
    }
  )
);
