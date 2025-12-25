import { ClipboardList, Clock, DollarSign, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { OrderCard } from "@/components/dashboard/OrderCard";
import { useStore } from "@/store/useStore";
import { Link } from "react-router-dom";

export default function DashboardOverview() {
  const { orders } = useStore();

  const activeOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "preparing"
  );
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const todayRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((acc, o) => acc + o.total, 0);
  const totalOrders = orders.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Orders"
          value={activeOrders.length}
          subtitle="Being processed"
          icon={ClipboardList}
        />
        <StatCard
          title="Pending"
          value={pendingOrders.length}
          subtitle="Awaiting prep"
          icon={Clock}
        />
        <StatCard
          title="Today's Revenue"
          value={`Rs. ${todayRevenue}`}
          subtitle="Completed orders"
          icon={DollarSign}
          variant="accent"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          subtitle="All time"
          icon={TrendingUp}
        />
      </div>

      {/* Active Orders */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">Active Orders</h2>
            <p className="text-sm text-muted-foreground">Orders that need your attention</p>
          </div>
          <Link
            to="/dashboard/orders"
            className="text-sm font-medium text-accent hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeOrders.length > 0 ? (
            activeOrders.map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No active orders right now</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
