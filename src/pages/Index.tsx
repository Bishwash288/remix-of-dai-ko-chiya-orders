import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Coffee, UtensilsCrossed, LayoutDashboard } from "lucide-react";

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          {/* Logo */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Coffee className="h-10 w-10 text-primary" />
          </div>

          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Dai Ko Chiya
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Welcome to our cozy tea shop! Scan, order, and enjoy authentic Nepali chai and delicious snacks.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" variant="accent" className="gap-2 px-8 py-6 text-base">
              <Link to="/menu">
                <UtensilsCrossed className="h-5 w-5" />
                View Menu
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 px-8 py-6 text-base">
              <Link to="/dashboard">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid max-w-4xl gap-8 px-4 sm:grid-cols-3">
          <FeatureCard
            icon={<Coffee className="h-6 w-6" />}
            title="Fresh Chai"
            description="Authentic Nepali tea made fresh with local spices and premium ingredients."
          />
          <FeatureCard
            icon={<UtensilsCrossed className="h-6 w-6" />}
            title="Delicious Snacks"
            description="Try our signature momos and other local delicacies to pair with your chai."
          />
          <FeatureCard
            icon={<LayoutDashboard className="h-6 w-6" />}
            title="Easy Ordering"
            description="Scan the QR code at your table to place orders directly from your phone."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Dai Ko Chiya. All rights reserved.</p>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center transition-all hover:shadow-card">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
        {icon}
      </div>
      <h3 className="font-heading font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
