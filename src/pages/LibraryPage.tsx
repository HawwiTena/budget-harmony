import { useState } from "react";
import { MOCK_LIBRARY_ITEMS } from "@/data/mockData";
import { LibraryItem, BudgetCategory, LibraryItemStatus, CapexSubCategory, CAPEX_SUB_CATEGORIES } from "@/types/budget";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Edit2, Ban, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";

export default function LibraryPage() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>(MOCK_LIBRARY_ITEMS);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<LibraryItem | null>(null);

  const isOfficer = currentUser.role === "strategic_officer";
  const isDirector = currentUser.role === "strategy_director";

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || i.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleSave = (item: Partial<LibraryItem>) => {
    if (editItem) {
      // Edit existing - if officer, goes to pending
      setItems(prev => prev.map(i =>
        i.id === editItem.id
          ? { ...i, ...item, status: isOfficer ? "pending_approval" as LibraryItemStatus : i.status, updatedAt: new Date().toISOString().split("T")[0] }
          : i
      ));
      toast.success(isOfficer ? "Changes submitted for approval" : "Item updated");
    } else {
      // New item
      const newItem: LibraryItem = {
        id: `lib-${Date.now()}`,
        name: item.name || "",
        category: (item.category as BudgetCategory) || "CAPEX",
        description: item.description || "",
        defaultAmount: item.defaultAmount || 0,
        status: isOfficer ? "pending_approval" : "active",
        createdBy: currentUser.id,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setItems(prev => [...prev, newItem]);
      toast.success(isOfficer ? "Item submitted for director approval" : "Item created");
    }
    setIsDialogOpen(false);
    setEditItem(null);
  };

  const handleApprove = (id: string) => {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, status: "active" as LibraryItemStatus, approvedBy: currentUser.id } : i
    ));
    toast.success("Item approved");
  };

  const handleReject = (id: string) => {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, status: "rejected" as LibraryItemStatus } : i
    ));
    toast.success("Item rejected");
  };

  const handleDeactivate = (id: string) => {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, status: "inactive" as LibraryItemStatus } : i
    ));
    toast.success("Item deactivated");
  };

  const statusIcon = (status: LibraryItemStatus) => {
    switch (status) {
      case "active": return <Check className="w-3.5 h-3.5 text-success" />;
      case "inactive": return <Ban className="w-3.5 h-3.5 text-muted-foreground" />;
      case "pending_approval": return <Clock className="w-3.5 h-3.5 text-warning" />;
      case "rejected": return <X className="w-3.5 h-3.5 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Budget Library</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage budget item templates · {isOfficer ? "Changes require director approval" : "You can approve/reject changes"}
          </p>
        </div>
        {(isOfficer || isDirector) && (
          <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) setEditItem(null); }}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">{editItem ? "Edit" : "New"} Library Item</DialogTitle>
              </DialogHeader>
              <LibraryItemForm item={editItem} onSave={handleSave} onCancel={() => { setIsDialogOpen(false); setEditItem(null); }} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="CAPEX">CAPEX</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Direct Expense">Direct Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pending Approvals (Director) */}
      {isDirector && items.filter(i => i.status === "pending_approval").length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning" />
            Pending Your Approval
          </h2>
          <div className="space-y-2">
            {items.filter(i => i.status === "pending_approval").map(item => (
              <div key={item.id} className="bg-card border border-warning/20 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category} · ETB {item.defaultAmount.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(item.id)} className="bg-success text-success-foreground hover:bg-success/90 h-8 text-xs">
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(item.id)} className="border-destructive text-destructive hover:bg-destructive/10 h-8 text-xs">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Items */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Item</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Category</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Default Amount</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-muted-foreground">{item.category}</span>
                  {item.capexSubCategory && (
                    <span className="text-xs text-muted-foreground block">{item.capexSubCategory}</span>
                  )}
                </td>
                </td>
                <td className="px-4 py-3 text-sm text-foreground text-right">
                  ETB {item.defaultAmount.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    {statusIcon(item.status)} {item.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {(isOfficer || isDirector) && item.status === "active" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => { setEditItem(item); setIsDialogOpen(true); }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleDeactivate(item.id)}
                        >
                          <Ban className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LibraryItemForm({ item, onSave, onCancel }: {
  item: LibraryItem | null;
  onSave: (data: Partial<LibraryItem>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name || "");
  const [category, setCategory] = useState<string>(item?.category || "CAPEX");
  const [capexSub, setCapexSub] = useState<string>(item?.capexSubCategory || "");
  const [description, setDescription] = useState(item?.description || "");
  const [amount, setAmount] = useState(item?.defaultAmount || 0);

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Name</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Item name" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Category</Label>
        <Select value={category} onValueChange={v => { setCategory(v); if (v !== "CAPEX") setCapexSub(""); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="CAPEX">CAPEX</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Direct Expense">Direct Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {category === "CAPEX" && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">CAPEX Sub-Category</Label>
          <Select value={capexSub} onValueChange={setCapexSub}>
            <SelectTrigger><SelectValue placeholder="Select sub-category" /></SelectTrigger>
            <SelectContent>
              {CAPEX_SUB_CATEGORIES.map(sub => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Default Amount (ETB)</Label>
        <Input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} />
      </div>
      <div className="flex gap-3 pt-2">
        <Button onClick={() => onSave({ name, category: category as BudgetCategory, capexSubCategory: category === "CAPEX" ? capexSub as CapexSubCategory : undefined, description, defaultAmount: amount })} className="bg-accent text-accent-foreground hover:bg-accent/90">
          {item ? "Update" : "Create"}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
