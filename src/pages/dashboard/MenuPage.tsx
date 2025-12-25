import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Star, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuItem } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = ["all", "tea", "snacks", "extras"] as const;

export default function MenuPage() {
  const { menuItems, addMenuItem, updateMenuItem } = useStore();
  const [filter, setFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "tea" as MenuItem["category"],
    isTodaySpecial: false,
  });

  const filteredItems =
    filter === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === filter);

  const todaySpecialCount = menuItems.filter((i) => i.isTodaySpecial).length;

  const handleSubmit = () => {
    if (editingItem) {
      updateMenuItem(editingItem.id, {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        category: formData.category,
        isTodaySpecial: formData.isTodaySpecial,
        discount: formData.originalPrice
          ? Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)
          : undefined,
      });
    } else {
      addMenuItem({
        id: crypto.randomUUID(),
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        category: formData.category,
        isAvailable: true,
        isTodaySpecial: formData.isTodaySpecial,
        discount: formData.originalPrice
          ? Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)
          : undefined,
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      category: "tea",
      isTodaySpecial: false,
    });
    setEditingItem(null);
    setDialogOpen(false);
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      originalPrice: item.originalPrice?.toString() || "",
      category: item.category,
      isTodaySpecial: item.isTodaySpecial,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Menu Management
          </h1>
          <p className="text-muted-foreground">
            Add, edit, and manage your menu items
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-accent">
            <Star className="h-4 w-4 fill-current" />
            {todaySpecialCount}/{menuItems.length} Today's Special set
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="accent" onClick={() => { setEditingItem(null); resetForm(); setDialogOpen(true); }}>
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Item name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (Rs.)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="40"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Original Price (optional)</Label>
                  <Input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as MenuItem["category"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tea">Tea</SelectItem>
                    <SelectItem value="snacks">Snacks</SelectItem>
                    <SelectItem value="extras">Extras</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Today's Special</Label>
                <Switch
                  checked={formData.isTodaySpecial}
                  onCheckedChange={(checked) => setFormData({ ...formData, isTodaySpecial: checked })}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full" variant="accent">
                {editingItem ? "Save Changes" : "Add Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(cat)}
            className="capitalize"
          >
            {cat}
          </Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">Showing {filteredItems.length} items</p>

      {/* Menu Items Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading font-semibold text-foreground">{item.name}</h3>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {item.category}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateMenuItem(item.id, { isTodaySpecial: !item.isTodaySpecial })}
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      item.isTodaySpecial ? "fill-accent text-accent" : "text-muted-foreground"
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEditDialog(item)}
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {item.isTodaySpecial && (
              <Badge variant="special" className="mt-2">
                <Star className="mr-1 h-3 w-3 fill-current" />
                Today's Special
              </Badge>
            )}

            {item.discount && (
              <Badge variant="discount" className="mt-2 ml-1">
                {item.discount}% OFF
              </Badge>
            )}

            <p className="mt-2 text-sm text-muted-foreground">
              {item.description || "No description"}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-bold text-accent">Rs. {item.price}</span>
                {item.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    Rs. {item.originalPrice}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm", item.isAvailable ? "text-status-ready" : "text-destructive")}>
                  {item.isAvailable ? "Available" : "Unavailable"}
                </span>
                <Switch
                  checked={item.isAvailable}
                  onCheckedChange={(checked) => updateMenuItem(item.id, { isAvailable: checked })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
