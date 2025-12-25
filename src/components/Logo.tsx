import { Coffee } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const iconSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${iconSizes[size]} rounded-xl bg-primary/10 flex items-center justify-center`}>
        <Coffee className="h-1/2 w-1/2 text-primary" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-heading font-bold text-primary ${textSizes[size]}`}>
            Dai Ko Chiya
          </span>
          <span className="text-xs text-muted-foreground">Shop Dashboard</span>
        </div>
      )}
    </div>
  );
}
