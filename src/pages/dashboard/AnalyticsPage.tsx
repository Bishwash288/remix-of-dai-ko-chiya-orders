import { useStore } from "@/store/useStore";
import { StatCard } from "@/components/dashboard/StatCard";
import { DollarSign, TrendingUp, ShoppingCart, Clock, RefreshCw, History, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function AnalyticsPage() {
  const { orders, menuItems, analyticsHistory, resetDailyStats } = useStore();
  const [activeTab, setActiveTab] = useState("today");

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Filter today's orders
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toISOString().split('T')[0] === today
  );

  const totalRevenue = todayOrders
    .filter((o) => o.status === "completed")
    .reduce((acc, o) => acc + o.total, 0);

  const totalOrders = todayOrders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Get last 7 days data
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const historyEntry = analyticsHistory.find((h) => h.date === dateStr);
      const dayOrders = orders.filter(
        (o) => new Date(o.createdAt).toISOString().split('T')[0] === dateStr
      );
      
      days.push({
        day: dayName,
        date: dateStr,
        revenue: historyEntry?.revenue || dayOrders.filter(o => o.status === 'completed').reduce((acc, o) => acc + o.total, 0),
        orders: historyEntry?.orders || dayOrders.length,
      });
    }
    return days;
  };

  const revenueData = getLast7Days();
  const ordersData = getLast7Days();

  // Order status distribution
  const statusData = [
    { name: "Pending", value: todayOrders.filter((o) => o.status === "pending").length, color: "hsl(45, 90%, 50%)" },
    { name: "Preparing", value: todayOrders.filter((o) => o.status === "preparing").length, color: "hsl(25, 90%, 55%)" },
    { name: "Ready", value: todayOrders.filter((o) => o.status === "ready").length, color: "hsl(280, 65%, 60%)" },
    { name: "Completed", value: todayOrders.filter((o) => o.status === "completed").length, color: "hsl(145, 65%, 42%)" },
  ].filter(d => d.value > 0);

  // Top selling items (today)
  const itemSales = menuItems.map((item) => {
    const totalSold = todayOrders.reduce((acc, order) => {
      const orderItem = order.items.find((i) => i.id === item.id);
      return acc + (orderItem?.quantity || 0);
    }, 0);
    const revenue = totalSold * item.price;
    return { ...item, totalSold, revenue };
  }).sort((a, b) => b.totalSold - a.totalSold);

  // Peak hours (today)
  const hourCounts: Record<string, number> = {};
  todayOrders.forEach((order) => {
    const hour = new Date(order.createdAt).getHours();
    const hourStr = `${hour.toString().padStart(2, '0')}:00`;
    hourCounts[hourStr] = (hourCounts[hourStr] || 0) + 1;
  });
  const peakHoursData = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour, orders: count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  const handleResetDaily = () => {
    resetDailyStats();
    toast({
      title: "Daily stats saved!",
      description: "Today's analytics have been saved to history and the day has been reset.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track your shop's performance and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetDaily}>
            <Calendar className="h-4 w-4" />
            End Day & Save
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="today" className="gap-2">
            <Clock className="h-4 w-4" />
            Today
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6 mt-6">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Today's Revenue" value={`Rs. ${totalRevenue.toLocaleString()}`} subtitle="Completed orders" icon={DollarSign} variant="accent" />
            <StatCard title="Today's Orders" value={totalOrders} subtitle="Total orders" icon={ShoppingCart} />
            <StatCard title="Avg. Order Value" value={`Rs. ${avgOrderValue}`} subtitle="Per order" icon={TrendingUp} />
            <StatCard title="Pending" value={todayOrders.filter(o => o.status === 'pending').length} subtitle="Awaiting prep" icon={Clock} />
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-heading font-semibold text-foreground">Revenue (Last 7 Days)</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `Rs.${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`Rs. ${value}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Orders Trend */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-heading font-semibold text-foreground">Orders Trend (Last 7 Days)</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ordersData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="orders" stroke="hsl(var(--foreground))" strokeWidth={2} dot={{ fill: "hsl(var(--foreground))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Selling Items */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-heading font-semibold text-foreground">Top Selling Items (Today)</h3>
              <div className="mt-4 space-y-3">
                {itemSales.filter(i => i.totalSold > 0).slice(0, 5).length > 0 ? (
                  itemSales.filter(i => i.totalSold > 0).slice(0, 5).map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 font-heading font-bold text-accent">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.totalSold} sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-heading font-semibold text-foreground">Rs. {item.revenue}</p>
                        <p className="text-xs text-muted-foreground">revenue</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">No sales today yet</div>
                )}
              </div>
            </div>

            {/* Order Status */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-heading font-semibold text-foreground">Order Status (Today)</h3>
              <div className="mt-4 h-48">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">No orders today</div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Peak Hours */}
          {peakHoursData.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-heading font-semibold text-foreground">Peak Hours (Today)</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="orders" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4">Historical Data</h3>
            {analyticsHistory.length > 0 ? (
              <div className="space-y-3">
                {analyticsHistory.slice().reverse().map((day) => (
                  <div key={day.date} className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {day.orders} orders • {day.completedOrders} completed
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-xl font-bold text-accent">Rs. {day.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <History className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-3 text-muted-foreground">No historical data yet</p>
                <p className="text-sm text-muted-foreground">Click "End Day & Save" to save today's stats</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
