import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";

export function ShopStatus() {
  const { settings } = useStore();

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Shop Status</span>
        <span className={`text-sm font-semibold ${settings.isOpen ? 'text-status-ready' : 'text-destructive'}`}>
          {settings.isOpen ? 'Currently Open' : 'Closed'}
        </span>
      </div>
      <div className={`ml-auto h-3 w-3 rounded-full ${settings.isOpen ? 'bg-status-ready animate-pulse-soft' : 'bg-destructive'}`} />
    </div>
  );
}
