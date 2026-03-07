import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MOCK_LIBRARY_ITEMS } from "@/data/mockData";
import { BudgetCategory, BudgetItemType, BudgetLineItem } from "@/types/budget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload, ArrowLeft, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function BudgetCreatePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [fiscalYear, setFiscalYear] = useState("2026/27");
  const [lineItems, setLineItems] = useState<BudgetLineItem[]>([]);
  const [activeTab, setActiveTab] = useState<BudgetCategory>("CAPEX");

  const activeLibraryItems = MOCK_LIBRARY_ITEMS.filter(i => i.status === "active" && i.category === activeTab);
  const tabs: BudgetCategory[] = ["CAPEX", "HR", "Direct Expense"];

  const addLineItem = (libraryItemId: string) => {
    const lib = MOCK_LIBRARY_ITEMS.find(i => i.id === libraryItemId);
    if (!lib) return;
    const newItem: BudgetLineItem = {
      id: `new-${Date.now()}`,
      libraryItemId: lib.id,
      libraryItemName: lib.name,
      category: lib.category,
      type: "new",
      quantity: 1,
      unitCost: lib.defaultAmount,
      totalCost: lib.defaultAmount,
      justification: "",
    };
    setLineItems(prev => [...prev, newItem]);
  };

  const updateLineItem = (id: string, updates: Partial<BudgetLineItem>) => {
    setLineItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates };
      updated.totalCost = updated.quantity * updated.unitCost;
      return updated;
    }));
  };

  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(i => i.id !== id));
  };

  const totalAmount = lineItems.reduce((sum, i) => sum + i.totalCost, 0);

  const hasReplacementWithoutAttachment = lineItems.some(
    i => i.type === "replacement" && !i.attachmentName
  );

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Please enter a budget title");
      return;
    }
    if (lineItems.length === 0) {
      toast.error("Please add at least one budget item");
      return;
    }
    if (hasReplacementWithoutAttachment) {
      toast.error("All replacement items require a document upload");
      return;
    }
    toast.success("Budget request submitted successfully!");
    navigate("/budgets");
  };

  const itemsByCategory = (cat: BudgetCategory) => lineItems.filter(i => i.category === cat);

  return (
    <div className="space-y-6 animate-slide-in">
      <Link to="/budgets" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="w-3 h-3" /> Back to budgets
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">New Budget Request</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Create a budget request for {currentUser.branch || currentUser.department || "your unit"}
        </p>
      </div>

      {/* Basic Info */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Bole Branch FY 2026/27 Budget" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fiscal Year</Label>
            <Select value={fiscalYear} onValueChange={setFiscalYear}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2026/27">2026/27</SelectItem>
                <SelectItem value="2027/28">2027/28</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {itemsByCategory(tab).length > 0 && (
              <span className="ml-2 bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded-full">
                {itemsByCategory(tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Library Items to Add */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Add from Library — {activeTab}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeLibraryItems.map(item => (
            <button
              key={item.id}
              onClick={() => addLineItem(item.id)}
              className="text-left border border-border rounded-lg p-3 hover:border-accent/50 hover:bg-accent/5 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground group-hover:text-accent">{item.name}</p>
                <Plus className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              <p className="text-xs font-medium text-foreground mt-1">ETB {item.defaultAmount.toLocaleString()}</p>
            </button>
          ))}
          {activeLibraryItems.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full">No active items in this category.</p>
          )}
        </div>
      </div>

      {/* Added Line Items */}
      {lineItems.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Budget Items ({lineItems.length})</h3>
            <p className="text-sm font-display font-bold text-foreground">
              Total: ETB {totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="divide-y divide-border">
            {lineItems.map(item => (
              <div key={item.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.libraryItemName}</p>
                    <span className="text-xs text-muted-foreground">{item.category}</span>
                  </div>
                  <button onClick={() => removeLineItem(item.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <Select value={item.type} onValueChange={v => updateLineItem(item.id, { type: v as BudgetItemType })}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="replacement">Replacement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Unit Cost (ETB)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={item.unitCost}
                      onChange={e => updateLineItem(item.id, { unitCost: parseFloat(e.target.value) || 0 })}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Total</Label>
                    <div className="h-9 flex items-center text-xs font-medium text-foreground">
                      ETB {item.totalCost.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Justification</Label>
                  <Textarea
                    value={item.justification}
                    onChange={e => updateLineItem(item.id, { justification: e.target.value })}
                    placeholder="Explain why this item is needed..."
                    className="min-h-[60px] text-xs"
                  />
                </div>
                {item.type === "replacement" && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Supporting Document <span className="text-accent">*</span>
                    </Label>
                    {item.attachmentName ? (
                      <p className="text-xs text-success">{item.attachmentName}</p>
                    ) : (
                      <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-accent/50 rounded-lg cursor-pointer hover:bg-accent/5 transition-colors">
                        <Upload className="w-4 h-4 text-accent" />
                        <span className="text-xs text-accent">Upload document (required for replacement items)</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) updateLineItem(item.id, { attachmentName: file.name, attachmentUrl: URL.createObjectURL(file) });
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between bg-card border border-border rounded-lg p-5">
        <div>
          <p className="text-sm text-muted-foreground">
            {lineItems.length} item{lineItems.length !== 1 ? "s" : ""} ·{" "}
            <span className="font-display font-bold text-foreground">ETB {totalAmount.toLocaleString()}</span>
          </p>
          {hasReplacementWithoutAttachment && (
            <p className="text-xs text-accent mt-1">⚠ Some replacement items are missing required documents</p>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/budgets")}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
            disabled={hasReplacementWithoutAttachment || lineItems.length === 0}
          >
            <Send className="w-4 h-4" /> Submit Budget
          </Button>
        </div>
      </div>
    </div>
  );
}
