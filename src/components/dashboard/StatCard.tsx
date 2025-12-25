import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "accent" | "success";
}

export function StatCard({ title, value, subtitle, icon: Icon, variant = "default" }: StatCardProps) {
  const variants = {
    default: "bg-card",
    accent: "bg-status-ready/10 border-status-ready/20",
    success: "bg-status-ready/10 border-status-ready/20",
  };

  const iconVariants = {
    default: "bg-muted text-muted-foreground",
    accent: "bg-status-ready/20 text-status-ready",
    success: "bg-status-ready/20 text-status-ready",
  };

  return (
    <div className={cn("rounded-xl border border-border p-5 transition-all hover:shadow-card", variants[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold font-heading text-foreground">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn("rounded-lg p-2.5", iconVariants[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
