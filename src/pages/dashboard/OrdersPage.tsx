import { useState } from "react";
import { OrderCard } from "@/components/dashboard/OrderCard";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Order } from "@/types";

const statusFilters: { label: string; value: Order["status"] | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready", value: "ready" },
  { label: "Completed", value: "completed" },
];

const statusDotColors = {
  all: "bg-primary",
  pending: "bg-status-pending",
  preparing: "bg-status-preparing",
  ready: "bg-status-ready",
  completed: "bg-status-completed",
};

export default function OrdersPage() {
  const { orders } = useStore();
  const [filter, setFilter] = useState<Order["status"] | "all">("all");

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">Manage and track all your orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter:</span>
        {statusFilters.map((status) => (
          <Button
            key={status.value}
            variant={filter === status.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status.value)}
            className="gap-2"
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                statusDotColors[status.value]
              )}
            />
            {status.label}
          </Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredOrders.length} orders
      </p>

      {/* Orders Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}
    </div>
  );
}
