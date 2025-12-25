import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Star, Pencil, Trash2, TrendingUp, TrendingDown, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuItem } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { toast } from "@/hooks/use-toast";

const categories = ["all", "tea", "snacks", "extras"] as const;

export default function MenuPage() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useStore();
  const [filter, setFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "tea" as MenuItem["category"],
    isTodaySpecial: false,
    isBestSelling: false,
    isLowestPrice: false,
    isAvailable: true,
  });

  const filteredItems =
    filter === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === filter);

  const todaySpecialCount = menuItems.filter((i) => i.isTodaySpecial).length;
  const bestSellingCount = menuItems.filter((i) => i.isBestSelling).length;
  const lowestPriceCount = menuItems.filter((i) => i.isLowestPrice).length;

  const handleSubmit = () => {
    if (!formData.name || !formData.price) {
      toast({ title: "Name and price are required", variant: "destructive" });
      return;
    }

    const discount = formData.originalPrice
      ? Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)
      : undefined;

    if (editingItem) {
      updateMenuItem(editingItem.id, {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        category: formData.category,
        isTodaySpecial: formData.isTodaySpecial,
        isBestSelling: formData.isBestSelling,
        isLowestPrice: formData.isLowestPrice,
        isAvailable: formData.isAvailable,
        discount,
      });
      toast({ title: "Item updated!" });
    } else {
      addMenuItem({
        id: crypto.randomUUID(),
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        category: formData.category,
        isAvailable: formData.isAvailable,
        isTodaySpecial: formData.isTodaySpecial,
        isBestSelling: formData.isBestSelling,
        isLowestPrice: formData.isLowestPrice,
        discount,
      });
      toast({ title: "Item added!" });
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
      isBestSelling: false,
      isLowestPrice: false,
      isAvailable: true,
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
      isBestSelling: item.isBestSelling,
      isLowestPrice: item.isLowestPrice,
      isAvailable: item.isAvailable,
    });
    setDialogOpen(true);
  };

  const handleDelete = (item: MenuItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMenuItem(itemToDelete.id);
      toast({ title: "Item deleted!" });
      setItemToDelete(null);
      setDeleteDialogOpen(false);
    }
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
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-accent">
              <Star className="h-4 w-4 fill-current" />
              {todaySpecialCount} Special
            </span>
            <span className="flex items-center gap-1 text-status-preparing">
              <TrendingUp className="h-4 w-4" />
              {bestSellingCount} Best Selling
            </span>
            <span className="flex items-center gap-1 text-status-ready">
              <TrendingDown className="h-4 w-4" />
              {lowestPriceCount} Lowest Price
            </span>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="accent" onClick={() => { setEditingItem(null); resetForm(); setDialogOpen(true); }}>
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name *</Label>
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
                  <Label>Price (Rs.) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="40"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Original Price (for discount)</Label>
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

              <div className="space-y-3 rounded-lg border border-border p-4">
                <h4 className="font-medium text-foreground">Item Tags</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-accent" />
                    <Label>Today's Special</Label>
                  </div>
                  <Switch
                    checked={formData.isTodaySpecial}
                    onCheckedChange={(checked) => setFormData({ ...formData, isTodaySpecial: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-status-preparing" />
                    <Label>Best Selling</Label>
                  </div>
                  <Switch
                    checked={formData.isBestSelling}
                    onCheckedChange={(checked) => setFormData({ ...formData, isBestSelling: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-status-ready" />
                    <Label>Lowest Price</Label>
                  </div>
                  <Switch
                    checked={formData.isLowestPrice}
                    onCheckedChange={(checked) => setFormData({ ...formData, isLowestPrice: checked })}
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <Label>Available for order</Label>
                  <Switch
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                  />
                </div>
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
            className={cn(
              "rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card",
              !item.isAvailable && "opacity-60"
            )}
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-2 flex flex-wrap gap-1">
              {item.isTodaySpecial && (
                <Badge variant="special" className="text-xs">
                  <Star className="mr-1 h-3 w-3 fill-current" />
                  Special
                </Badge>
              )}
              {item.isBestSelling && (
                <Badge className="bg-status-preparing/20 text-status-preparing text-xs">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Best Selling
                </Badge>
              )}
              {item.isLowestPrice && (
                <Badge className="bg-status-ready/20 text-status-ready text-xs">
                  <TrendingDown className="mr-1 h-3 w-3" />
                  Lowest
                </Badge>
              )}
              {item.discount && (
                <Badge variant="discount" className="text-xs">
                  {item.discount}% OFF
                </Badge>
              )}
            </div>

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{itemToDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the item from your menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
