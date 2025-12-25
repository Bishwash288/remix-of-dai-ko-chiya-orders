import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Store, Image, Link, Bell, Volume2, Copy, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const baseUrl = window.location.origin;
  const shopUrl = `${baseUrl}/menu`;

  const copyUrl = () => {
    navigator.clipboard.writeText(shopUrl);
    toast({
      title: "Link copied!",
      description: "Shop URL copied to clipboard",
    });
  };

  const handleSave = () => {
    toast({
      title: "Settings saved!",
      description: "Your changes have been saved successfully",
    });
  };

  const testSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your shop settings and preferences</p>
      </div>

      {/* Shop Status */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-status-ready to-accent" />
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-status-ready/10 p-2">
                <Store className="h-5 w-5 text-status-ready" />
              </div>
              <div>
                <p className="font-medium text-foreground">Shop Status</p>
                <p className={`text-sm ${settings.isOpen ? 'text-status-ready' : 'text-destructive'}`}>
                  {settings.isOpen ? 'Open for orders' : 'Closed'}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.isOpen}
              onCheckedChange={(checked) => updateSettings({ isOpen: checked })}
            />
          </div>
        </div>
      </div>

      {/* Shop Logo */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-heading font-semibold text-foreground">Shop Logo</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your shop logo (max 2MB, JPEG/PNG/WebP/GIF)
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
            <Image className="h-8 w-8 text-muted-foreground" />
          </div>
          <Button variant="outline">
            <Upload className="h-4 w-4" />
            Upload Logo
          </Button>
        </div>
      </div>

      {/* Shop Information */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-heading font-semibold text-foreground">Shop Information</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your shop details visible to customers
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Shop Name</Label>
            <Input
              value={settings.name}
              onChange={(e) => updateSettings({ name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={settings.description}
              onChange={(e) => updateSettings({ description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Number of Tables</Label>
            <Input
              type="number"
              value={settings.numberOfTables}
              onChange={(e) => updateSettings({ numberOfTables: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              This determines how many QR codes you can generate
            </p>
          </div>
          <Button variant="accent" onClick={handleSave}>Save Changes</Button>
        </div>
      </div>

      {/* Shop URL */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Link className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-heading font-semibold text-foreground">Shop URL</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Share this link with customers
        </p>
        <div className="mt-4 flex gap-2">
          <Input value={shopUrl} readOnly className="flex-1" />
          <Button variant="outline" size="icon" onClick={copyUrl}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-heading font-semibold text-foreground">Notifications</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure how you receive order notifications
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Sound Alerts</p>
                <p className="text-sm text-muted-foreground">Play a sound for new orders</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={testSound}>
                ▶ Test
              </Button>
              <Switch
                checked={settings.soundAlerts}
                onCheckedChange={(checked) => updateSettings({ soundAlerts: checked })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Browser Notifications</p>
                <p className="text-sm text-muted-foreground">Show desktop notifications</p>
              </div>
            </div>
            <Switch
              checked={settings.browserNotifications}
              onCheckedChange={(checked) => updateSettings({ browserNotifications: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
