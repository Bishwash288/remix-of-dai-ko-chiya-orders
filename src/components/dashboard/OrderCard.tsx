import { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Clock, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: Order;
}

const statusColors = {
  pending: "border-l-status-pending",
  preparing: "border-l-status-preparing",
  ready: "border-l-status-ready",
  completed: "border-l-status-completed",
};

export function OrderCard({ order }: OrderCardProps) {
  const { updateOrderStatus } = useStore();

  const handleStatusChange = (status: Order["status"]) => {
    updateOrderStatus(order.id, status);
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card animate-fade-in",
        "border-l-4",
        statusColors[order.status]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-semibold text-foreground">
            Table {order.tableNumber}
          </h3>
          <Badge variant={order.status}>{order.status}</Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusChange("pending")}>
              Mark as Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("preparing")}>
              Mark as Preparing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("ready")}>
              Mark as Ready
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
              Mark as Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
        <span># {order.orderNumber}</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(order.createdAt, { addSuffix: true })}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/10 text-xs font-medium text-accent">
                {item.quantity}
              </span>
              <span className="text-foreground">{item.name}</span>
            </div>
            <span className="text-muted-foreground">Rs. {item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      {order.items.some((item) => item.notes) && (
        <div className="mt-3 rounded-lg bg-accent/10 p-2.5">
          {order.items
            .filter((item) => item.notes)
            .map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs text-accent">
                <FileText className="h-3 w-3" />
                {item.notes}
              </div>
            ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm text-muted-foreground">
          {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
        </span>
        <span className="font-heading font-bold text-foreground">Rs. {order.total}</span>
      </div>
    </div>
  );
}
