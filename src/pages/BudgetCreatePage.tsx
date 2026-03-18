import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MOCK_LIBRARY_ITEMS } from "@/data/mockData";
import { BudgetCategory, BudgetLineItem, BudgetItemRemark, BUDGET_ITEM_REMARKS, CAPEX_SUB_CATEGORIES, QUARTERS, Quarter, getLibraryItemName, getLibraryItemAmount } from "@/types/budget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload, ArrowLeft, Send, Save, RotateCcw, ChevronDown, ChevronRight, Library, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { saveDraft, loadDraft, clearDraft, hasDraft } from "@/lib/draftUtils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function BudgetCreatePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [fiscalYear, setFiscalYear] = useState("2026/27");
  const [lineItems, setLineItems] = useState<BudgetLineItem[]>([]);
  const [activeTab, setActiveTab] = useState<BudgetCategory>("CAPEX");
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Collapsible states
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [budgetItemsOpen, setBudgetItemsOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (hasDraft()) setShowDraftBanner(true);
  }, []);

  const triggerAutoSave = useCallback(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      if (title || lineItems.length > 0) {
        saveDraft({ title, fiscalYear, lineItems, activeTab, savedAt: new Date().toISOString() });
      }
    }, 2000);
  }, [title, fiscalYear, lineItems, activeTab]);

  useEffect(() => {
    triggerAutoSave();
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [title, fiscalYear, lineItems, activeTab, triggerAutoSave]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (title || lineItems.length > 0) {
        saveDraft({ title, fiscalYear, lineItems, activeTab, savedAt: new Date().toISOString() });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [title, fiscalYear, lineItems, activeTab]);

  const handleRestoreDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setTitle(draft.title);
      setFiscalYear(draft.fiscalYear);
      setLineItems(draft.lineItems);
      setActiveTab(draft.activeTab);
      toast.success(`Draft restored (saved ${new Date(draft.savedAt).toLocaleString()})`);
    }
    setShowDraftBanner(false);
  };

  const handleDismissDraft = () => { clearDraft(); setShowDraftBanner(false); };

  const handleSaveDraft = () => {
    saveDraft({ title, fiscalYear, lineItems, activeTab, savedAt: new Date().toISOString() });
    toast.success("Draft saved successfully");
  };

  const activeLibraryItems = MOCK_LIBRARY_ITEMS.filter(i => i.status === "ACTIVE" && i.category === activeTab);
  const tabs: BudgetCategory[] = ["CAPEX", "HR", "Direct Expense"];

  const addLineItem = (libraryItemId: string) => {
    const lib = MOCK_LIBRARY_ITEMS.find(i => i.id === libraryItemId);
    if (!lib) return;
    const name = getLibraryItemName(lib);
    const amount = getLibraryItemAmount(lib);
    const newId = `new-${Date.now()}`;
    const newItem: BudgetLineItem = {
      id: newId,
      libraryItemId: lib.id,
      libraryItemName: name,
      category: lib.category,
      capexSubCategory: lib.category === "CAPEX" ? lib.itemCategory : undefined,
      remark: "NEW",
      quantity: 1,
      unitCost: amount,
      totalCost: amount,
      amount: amount,
      purposeAndNecessity: "",
      desiredQuarterForProcurement: "QUARTER_1",
    };
    setLineItems(prev => [newItem, ...prev]);
    setExpandedItems(prev => new Set(prev).add(newId));
    toast.success(`Added "${name}" to budget`);
  };

  const updateLineItem = (id: string, updates: Partial<BudgetLineItem>) => {
    setLineItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates };
      updated.totalCost = updated.quantity * updated.unitCost;
      updated.amount = updated.totalCost;
      return updated;
    }));
  };

  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(i => i.id !== id));
    setExpandedItems(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const toggleItemExpanded = (id: string) => {
    setExpandedItems(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const totalAmount = lineItems.reduce((sum, i) => sum + i.totalCost, 0);
  const hasReplacementWithoutDocument = lineItems.some(i => i.remark === "REPLACEMENT" && !i.documentName);

  const handleSubmit = () => {
    if (!title.trim()) { toast.error("Please enter a budget title"); return; }
    if (lineItems.length === 0) { toast.error("Please add at least one budget item"); return; }
    if (hasReplacementWithoutDocument) { toast.error("All replacement items require a document upload"); return; }
    clearDraft();
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

      {showDraftBanner && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-warning" />
            <p className="text-sm text-foreground">You have an unsaved draft. Would you like to restore it?</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleDismissDraft}>Discard</Button>
            <Button size="sm" onClick={handleRestoreDraft} className="bg-warning text-warning-foreground hover:bg-warning/90">Restore Draft</Button>
          </div>
        </div>
      )}

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

      {/* Library Items - Collapsible */}
      <Collapsible open={libraryOpen} onOpenChange={setLibraryOpen}>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <CollapsibleTrigger className="w-full px-5 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              <Library className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">Item Library — {activeTab}</h3>
              <span className="text-xs text-muted-foreground">({activeLibraryItems.length} items)</span>
            </div>
            {libraryOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-5 pb-5 pt-2">
              {activeTab === "CAPEX" ? (
                <div className="space-y-5">
                  {CAPEX_SUB_CATEGORIES.map(sub => {
                    const subItems = activeLibraryItems.filter(i => i.category === "CAPEX" && (i as import("@/types/budget").CapexLibraryItem).itemCategory === sub);
                    if (subItems.length === 0) return null;
                    return (
                      <CapexSubGroup key={sub} label={sub} items={subItems} onAdd={addLineItem} />
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeLibraryItems.map(item => {
                    const name = getLibraryItemName(item);
                    const amount = getLibraryItemAmount(item);
                    return (
                      <button
                        key={item.id}
                        onClick={() => addLineItem(item.id)}
                        className="text-left border border-border rounded-lg p-3 hover:border-accent/50 hover:bg-accent/5 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground group-hover:text-accent">{name}</p>
                          <Plus className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                        </div>
                        {item.category === "HR" && (
                          <p className="text-xs text-muted-foreground mt-1">{item.jobGrade} · {item.jobCategory}</p>
                        )}
                        {amount > 0 && <p className="text-xs font-medium text-foreground mt-1">ETB {amount.toLocaleString()}</p>}
                      </button>
                    );
                  })}
                </div>
              )}
              {activeLibraryItems.length === 0 && (
                <p className="text-sm text-muted-foreground">No active items in this category.</p>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Added Budget Items - Collapsible */}
      {lineItems.length > 0 && (
        <Collapsible open={budgetItemsOpen} onOpenChange={setBudgetItemsOpen}>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <CollapsibleTrigger className="w-full px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">Budget Items ({lineItems.length})</h3>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-display font-bold text-foreground">
                  Total: ETB {totalAmount.toLocaleString()}
                </p>
                {budgetItemsOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="divide-y divide-border">
                {lineItems.map(item => (
                  <BudgetItemRow
                    key={item.id}
                    item={item}
                    expanded={expandedItems.has(item.id)}
                    onToggle={() => toggleItemExpanded(item.id)}
                    onUpdate={updateLineItem}
                    onRemove={removeLineItem}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between bg-card border border-border rounded-lg p-5">
        <div>
          <p className="text-sm text-muted-foreground">
            {lineItems.length} item{lineItems.length !== 1 ? "s" : ""} ·{" "}
            <span className="font-display font-bold text-foreground">ETB {totalAmount.toLocaleString()}</span>
          </p>
          {hasReplacementWithoutDocument && (
            <p className="text-xs text-accent mt-1">⚠ Some replacement items are missing required documents</p>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
            <Save className="w-4 h-4" /> Save Draft
          </Button>
          <Button variant="outline" onClick={() => navigate("/budgets")}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
            disabled={hasReplacementWithoutDocument || lineItems.length === 0}
          >
            <Send className="w-4 h-4" /> Submit Budget
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function CapexSubGroup({ label, items, onAdd }: { label: string; items: import("@/types/budget").LibraryItem[]; onAdd: (id: string) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full group mb-2">
        {open ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">{label}</p>
        <span className="text-xs text-muted-foreground">({items.length})</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => {
            const capex = item as import("@/types/budget").CapexLibraryItem;
            return (
              <button
                key={item.id}
                onClick={() => onAdd(item.id)}
                className="text-left border border-border rounded-lg p-3 hover:border-accent/50 hover:bg-accent/5 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground group-hover:text-accent">{capex.itemName}</p>
                  <Plus className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{capex.unitOfMeasurement}</p>
                <p className="text-xs font-medium text-foreground mt-1">ETB {capex.unitPrice.toLocaleString()}</p>
              </button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function BudgetItemRow({ item, expanded, onToggle, onUpdate, onRemove }: {
  item: BudgetLineItem;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, updates: Partial<BudgetLineItem>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="group">
      {/* Summary row - always visible */}
      <div className="px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors" onClick={onToggle}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{item.libraryItemName}</p>
            <span className="text-xs text-muted-foreground">{item.category}{item.capexSubCategory ? ` · ${item.capexSubCategory}` : ""}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">ETB {item.totalCost.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {item.unitCost.toLocaleString()}</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onRemove(item.id); }}
            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detail fields - collapsible */}
      {expanded && (
        <div className="px-5 pb-4 pt-1 ml-7 space-y-3 border-l-2 border-accent/20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Remark</Label>
              <Select value={item.remark} onValueChange={v => onUpdate(item.id, { remark: v as BudgetItemRemark })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BUDGET_ITEM_REMARKS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Desired Quarter</Label>
              <Select value={item.desiredQuarterForProcurement} onValueChange={v => onUpdate(item.id, { desiredQuarterForProcurement: v as Quarter })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QUARTERS.map(q => <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Quantity</Label>
              <Input type="number" min={1} value={item.quantity} onChange={e => onUpdate(item.id, { quantity: parseInt(e.target.value) || 1 })} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Unit Cost (ETB)</Label>
              <Input type="number" min={0} value={item.unitCost} onChange={e => onUpdate(item.id, { unitCost: parseFloat(e.target.value) || 0 })} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Total</Label>
              <div className="h-9 flex items-center text-xs font-medium text-foreground">ETB {item.totalCost.toLocaleString()}</div>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Purpose & Necessity</Label>
            <Textarea
              value={item.purposeAndNecessity}
              onChange={e => onUpdate(item.id, { purposeAndNecessity: e.target.value })}
              placeholder="Explain the purpose and necessity for this item..."
              className="min-h-[60px] text-xs"
              onClick={e => e.stopPropagation()}
            />
          </div>
          {item.remark === "REPLACEMENT" && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Supporting Document <span className="text-accent">*</span>
              </Label>
              {item.documentName ? (
                <p className="text-xs text-success">{item.documentName}</p>
              ) : (
                <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-accent/50 rounded-lg cursor-pointer hover:bg-accent/5 transition-colors">
                  <Upload className="w-4 h-4 text-accent" />
                  <span className="text-xs text-accent">Upload document (required for replacement items)</span>
                  <input type="file" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) onUpdate(item.id, { documentName: file.name, documentId: crypto.randomUUID() });
                  }} />
                </label>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
