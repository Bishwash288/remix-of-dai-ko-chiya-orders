import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Coffee, Plus, Minus, ShoppingCart, Star, Menu, X, MapPin, Send, Clock, ChefHat, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { MenuItem, Order } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const categories = ["All", "Tea", "Snacks", "Extras"] as const;

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableParam = searchParams.get("table");
  const [tableNumber, setTableNumber] = useState<number | null>(tableParam ? parseInt(tableParam) : null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [orderTrackingOpen, setOrderTrackingOpen] = useState(false);

  const { 
    menuItems, 
    settings, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartItemQuantity, 
    clearCart, 
    addOrder,
    orders,
    customerOrderId,
    setCustomerOrderId
  } = useStore();

  const availableItems = menuItems.filter((item) => item.isAvailable);
  const filteredItems = activeCategory === "All"
    ? availableItems
    : availableItems.filter((item) => item.category.toLowerCase() === activeCategory.toLowerCase());

  const todaySpecials = availableItems.filter((item) => item.isTodaySpecial);
  const bestSellers = availableItems.filter((item) => item.isBestSelling);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Get current order status
  const currentOrder = customerOrderId ? orders.find((o) => o.id === customerOrderId) : null;

  const getItemQuantityInCart = (itemId: string) => {
    const cartItem = cart.find((item) => item.id === itemId);
    return cartItem?.quantity || 0;
  };

  const handlePlaceOrder = () => {
    if (!tableNumber) {
      toast({ title: "Please select a table", variant: "destructive" });
      return;
    }
    if (cart.length === 0) {
      toast({ title: "Cart is empty", variant: "destructive" });
      return;
    }

    const orderId = crypto.randomUUID();
    const orderNumber = orders.length + 1;

    // Use the store's addOrder which already handles notifications
    addOrder({
      tableNumber,
      items: cart.map((item) => ({
        ...item,
        notes: orderNotes || undefined,
      })),
      total: cartTotal,
      status: "pending",
    });

    // Get the newly created order ID
    const newOrder = orders[0];
    setCustomerOrderId(newOrder?.id || orderId);

    clearCart();
    setOrderNotes("");
    setCartOpen(false);
    setOrderTrackingOpen(true);
    toast({
      title: "Order placed!",
      description: `Your order for Table ${tableNumber} has been sent to the kitchen.`,
    });
  };

  // Table selection modal
  const [showTableSelect, setShowTableSelect] = useState(!tableNumber);

  // Status display helper
  const getStatusDisplay = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, text: 'Order Received', color: 'text-status-pending bg-status-pending/20', desc: 'Your order has been received and is waiting to be prepared.' };
      case 'preparing':
        return { icon: ChefHat, text: 'Preparing', color: 'text-status-preparing bg-status-preparing/20', desc: 'The kitchen is preparing your order.' };
      case 'ready':
        return { icon: CheckCircle, text: 'Ready!', color: 'text-status-ready bg-status-ready/20', desc: 'Your order is ready for pickup!' };
      case 'completed':
        return { icon: CheckCircle, text: 'Completed', color: 'text-muted-foreground bg-muted', desc: 'Order completed. Thank you!' };
      default:
        return { icon: Clock, text: 'Unknown', color: 'text-muted-foreground bg-muted', desc: '' };
    }
  };

  // Poll for order status updates
  useEffect(() => {
    if (customerOrderId && currentOrder?.status !== 'completed') {
      const interval = setInterval(() => {
        // Force re-render to get latest status
        const order = orders.find((o) => o.id === customerOrderId);
        if (order?.status === 'ready') {
          toast({
            title: "🎉 Your order is ready!",
            description: "Please collect your order from the counter.",
          });
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [customerOrderId, currentOrder?.status, orders]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-primary">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10">
              <Coffee className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-primary-foreground">{settings.name}</h1>
              <p className="text-xs text-primary-foreground/70">{settings.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentOrder && currentOrder.status !== 'completed' && (
              <Button
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setOrderTrackingOpen(true)}
              >
                <Clock className="h-5 w-5" />
                Track
              </Button>
            )}
            <Button
              variant="ghost"
              className="relative text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Status bar */}
        <div className="container flex items-center gap-3 pb-3">
          {settings.isOpen ? (
            <Badge variant="ready" className="gap-1">
              <span className="h-2 w-2 rounded-full bg-accent-foreground animate-pulse-soft" />
              Open Now
            </Badge>
          ) : (
            <Badge variant="destructive">Closed</Badge>
          )}
          {tableNumber && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setShowTableSelect(true)}>
              <MapPin className="h-3 w-3" />
              Table {tableNumber}
            </Badge>
          )}
          {currentOrder && currentOrder.status !== 'completed' && (
            <Badge 
              className={cn("gap-1 cursor-pointer", getStatusDisplay(currentOrder.status).color)}
              onClick={() => setOrderTrackingOpen(true)}
            >
              {(() => {
                const StatusIcon = getStatusDisplay(currentOrder.status).icon;
                return <StatusIcon className="h-3 w-3" />;
              })()}
              {getStatusDisplay(currentOrder.status).text}
            </Badge>
          )}
        </div>
      </header>

      {/* Category Filter */}
      <div className="sticky top-[105px] z-30 border-b border-border bg-background py-3">
        <div className="container flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Content */}
      <main className="container py-6 pb-32">
        {/* Today's Specials */}
        {activeCategory === "All" && todaySpecials.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 fill-accent text-accent" />
              <h2 className="font-heading font-semibold text-foreground">Today's Special</h2>
              <span className="text-sm text-muted-foreground">Chef's recommended picks for today</span>
            </div>
            <div className="space-y-3">
              {todaySpecials.map((item) => (
                <MenuItemCard key={item.id} item={item} quantity={getItemQuantityInCart(item.id)} onAdd={() => addToCart(item)} onRemove={() => {
                  const qty = getItemQuantityInCart(item.id);
                  updateCartItemQuantity(item.id, qty - 1);
                }} isSpecial />
              ))}
            </div>
          </section>
        )}

        {/* Best Sellers */}
        {activeCategory === "All" && bestSellers.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-status-preparing" />
              <h2 className="font-heading font-semibold text-foreground">Best Sellers</h2>
              <span className="text-sm text-muted-foreground">Customer favorites</span>
            </div>
            <div className="space-y-3">
              {bestSellers.filter(item => !item.isTodaySpecial).map((item) => (
                <MenuItemCard key={item.id} item={item} quantity={getItemQuantityInCart(item.id)} onAdd={() => addToCart(item)} onRemove={() => {
                  const qty = getItemQuantityInCart(item.id);
                  updateCartItemQuantity(item.id, qty - 1);
                }} />
              ))}
            </div>
          </section>
        )}

        {/* Menu by Category */}
        {activeCategory === "All" ? (
          <>
            {["tea", "snacks", "extras"].map((category) => {
              const items = availableItems.filter((item) => item.category === category && !item.isTodaySpecial);
              if (items.length === 0) return null;
              return (
                <section key={category} className="mb-8">
                  <div className="mb-4 flex items-center gap-2">
                    <h2 className="font-heading font-semibold capitalize text-foreground">{category}</h2>
                    <Badge variant="secondary">{items.length} items</Badge>
                  </div>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <MenuItemCard key={item.id} item={item} quantity={getItemQuantityInCart(item.id)} onAdd={() => addToCart(item)} onRemove={() => {
                        const qty = getItemQuantityInCart(item.id);
                        updateCartItemQuantity(item.id, qty - 1);
                      }} />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} quantity={getItemQuantityInCart(item.id)} onAdd={() => addToCart(item)} onRemove={() => {
                const qty = getItemQuantityInCart(item.id);
                updateCartItemQuantity(item.id, qty - 1);
              }} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-8 md:w-96">
          <Button
            className="w-full gap-2 py-6 text-base shadow-warm"
            variant="accent"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            View Cart ({cartItemCount} items)
            <span className="ml-auto font-heading font-bold">Rs. {cartTotal}</span>
          </Button>
        </div>
      )}

      {/* Cart Dialog */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Order
              {tableNumber && (
                <Badge variant="secondary">Table {tableNumber}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {cart.length === 0 ? (
            <div className="py-8 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 py-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Rs. {item.price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => addToCart(item)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Special instructions</label>
                  <Textarea
                    placeholder="Any special requests? (e.g., less sugar, extra spicy)"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-lg font-medium text-foreground">Total</span>
                  <span className="font-heading text-2xl font-bold text-foreground">Rs. {cartTotal}</span>
                </div>

                <Button
                  className="w-full gap-2 py-6"
                  variant="accent"
                  onClick={handlePlaceOrder}
                  disabled={!settings.isOpen}
                >
                  <Send className="h-5 w-5" />
                  {settings.isOpen ? "Place Order" : "Shop is Closed"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Tracking Dialog */}
      <Dialog open={orderTrackingOpen} onOpenChange={setOrderTrackingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Order Status
            </DialogTitle>
          </DialogHeader>
          
          {currentOrder ? (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <div className={cn(
                  "mx-auto flex h-20 w-20 items-center justify-center rounded-full",
                  getStatusDisplay(currentOrder.status).color
                )}>
                  {(() => {
                    const StatusIcon = getStatusDisplay(currentOrder.status).icon;
                    return <StatusIcon className="h-10 w-10" />;
                  })()}
                </div>
                <h3 className="mt-4 font-heading text-xl font-bold text-foreground">
                  {getStatusDisplay(currentOrder.status).text}
                </h3>
                <p className="mt-1 text-muted-foreground">
                  {getStatusDisplay(currentOrder.status).desc}
                </p>
              </div>

              {/* Progress Steps */}
              <div className="flex justify-between px-4">
                {['pending', 'preparing', 'ready'].map((status, index) => {
                  const steps = ['pending', 'preparing', 'ready'];
                  const currentIndex = steps.indexOf(currentOrder.status);
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  
                  return (
                    <div key={status} className="flex flex-col items-center">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                        isCompleted 
                          ? "border-accent bg-accent text-accent-foreground" 
                          : "border-muted bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <span className={cn(
                        "mt-2 text-xs capitalize",
                        isCurrent ? "font-medium text-accent" : "text-muted-foreground"
                      )}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Order Details */}
              <div className="rounded-lg bg-secondary/50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order #</span>
                  <span className="font-medium">{currentOrder.orderNumber}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Table</span>
                  <span className="font-medium">{currentOrder.tableNumber}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">Rs. {currentOrder.total}</span>
                </div>
                <div className="mt-3 border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">Items:</span>
                  <ul className="mt-1 space-y-1">
                    {currentOrder.items.map((item, i) => (
                      <li key={i} className="text-sm">
                        {item.quantity}x {item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No active order</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Table Selection Dialog */}
      <Dialog open={showTableSelect} onOpenChange={setShowTableSelect}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Your Table</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-2 py-4">
            {Array.from({ length: settings.numberOfTables }, (_, i) => i + 1).map((num) => (
              <Button
                key={num}
                variant={tableNumber === num ? "accent" : "outline"}
                onClick={() => {
                  setTableNumber(num);
                  setShowTableSelect(false);
                }}
              >
                {num}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  isSpecial?: boolean;
}

function MenuItemCard({ item, quantity, onAdd, onRemove, isSpecial }: MenuItemCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card",
        isSpecial && "border-accent/30 bg-accent/5"
      )}
    >
      {isSpecial && (
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Star className="h-4 w-4 fill-current" />
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-status-ready" />
            <h3 className="font-medium text-foreground">{item.name}</h3>
            {item.isBestSelling && (
              <Badge className="bg-status-preparing/20 text-status-preparing text-xs">
                <TrendingUp className="mr-1 h-3 w-3" />
                Popular
              </Badge>
            )}
            {item.isLowestPrice && (
              <Badge className="bg-status-ready/20 text-status-ready text-xs">
                <TrendingDown className="mr-1 h-3 w-3" />
                Value
              </Badge>
            )}
            {item.discount && (
              <Badge variant="discount" className="text-xs">
                {item.discount}% OFF
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <span className="font-heading font-bold text-accent">Rs. {item.price}</span>
            {item.originalPrice && (
              <span className="ml-2 text-sm text-muted-foreground line-through">
                Rs. {item.originalPrice}
              </span>
            )}
          </div>

          {quantity === 0 ? (
            <Button
              variant="accent"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={onAdd}
            >
              <Plus className="h-5 w-5" />
            </Button>
          ) : (
            <div className="flex items-center gap-2 rounded-full bg-accent/10 p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={onRemove}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-6 text-center font-medium text-foreground">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={onAdd}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
