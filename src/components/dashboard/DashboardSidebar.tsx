import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  QrCode,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ShopStatus } from "@/components/ShopStatus";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: ClipboardList, label: "Orders", path: "/dashboard/orders" },
  { icon: UtensilsCrossed, label: "Menu", path: "/dashboard/menu" },
  { icon: QrCode, label: "QR Codes", path: "/dashboard/qr-codes" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export function DashboardSidebar() {
  const location = useLocation();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      <div className="p-4">
        <Logo />
      </div>

      <div className="px-4 py-2">
        <ShopStatus />
      </div>

      <nav className="flex-1 px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Navigation
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-sidebar-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-accent")} />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Exit Dashboard
        </Link>
      </div>
    </aside>
  );
}
