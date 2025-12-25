import { useStore } from "@/store/useStore";
import { StatCard } from "@/components/dashboard/StatCard";
import { DollarSign, TrendingUp, ShoppingCart, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function AnalyticsPage() {
  const { orders, menuItems } = useStore();

  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((acc, o) => acc + o.total, 0);

  const thisWeekRevenue = totalRevenue; // Simplified for demo
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Revenue data (last 7 days mock)
  const revenueData = [
    { day: "Fri", revenue: 0 },
    { day: "Sat", revenue: 0 },
    { day: "Sun", revenue: 0 },
    { day: "Mon", revenue: 0 },
    { day: "Wed", revenue: 0 },
    { day: "Thu", revenue: totalRevenue },
  ];

  // Orders trend
  const ordersData = [
    { day: "Fri", orders: 0 },
    { day: "Sat", orders: 0 },
    { day: "Sun", orders: 0 },
    { day: "Mon", orders: 0 },
    { day: "Wed", orders: 0 },
    { day: "Thu", orders: totalOrders },
  ];

  // Order status distribution
  const statusData = [
    { name: "Preparing", value: orders.filter((o) => o.status === "preparing").length, color: "hsl(25, 90%, 55%)" },
    { name: "Ready", value: orders.filter((o) => o.status === "ready").length, color: "hsl(280, 65%, 60%)" },
    { name: "Completed", value: orders.filter((o) => o.status === "completed").length, color: "hsl(145, 65%, 42%)" },
  ].filter(d => d.value > 0);

  // Top selling items
  const itemSales = menuItems.map((item) => {
    const totalSold = orders.reduce((acc, order) => {
      const orderItem = order.items.find((i) => i.id === item.id);
      return acc + (orderItem?.quantity || 0);
    }, 0);
    const revenue = totalSold * item.price;
    return { ...item, totalSold, revenue };
  }).sort((a, b) => b.totalSold - a.totalSold);

  // Peak hours (mock data)
  const peakHoursData = [
    { hour: "08:00", orders: 1 },
    { hour: "10:00", orders: 1 },
    { hour: "11:00", orders: 2 },
    { hour: "12:00", orders: 1 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track your shop's performance and insights</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={`Rs. ${totalRevenue.toLocaleString()}`} subtitle="All time" icon={DollarSign} variant="accent" />
        <StatCard title="This Week" value={`Rs. ${thisWeekRevenue.toLocaleString()}`} subtitle="Last 7 days" icon={TrendingUp} />
        <StatCard title="Total Orders" value={totalOrders} subtitle="All time" icon={ShoppingCart} />
        <StatCard title="Avg. Order Value" value={`Rs. ${avgOrderValue}`} subtitle="Per order" icon={Clock} />
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
          <h3 className="font-heading font-semibold text-foreground">Top Selling Items</h3>
          <div className="mt-4 space-y-3">
            {itemSales.slice(0, 3).map((item, index) => (
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
            ))}
          </div>
        </div>

        {/* Order Status */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-heading font-semibold text-foreground">Order Status</h3>
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
              <div className="flex h-full items-center justify-center text-muted-foreground">No data</div>
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
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-heading font-semibold text-foreground">Peak Hours (Last 7 Days)</h3>
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
    </div>
  );
}
