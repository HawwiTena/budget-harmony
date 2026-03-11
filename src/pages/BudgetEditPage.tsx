import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MOCK_BUDGET_REQUESTS, MOCK_LIBRARY_ITEMS } from "@/data/mockData";
import {
  BudgetCategory, BudgetLineItem, BudgetItemRemark, BUDGET_ITEM_REMARKS,
  CAPEX_SUB_CATEGORIES, QUARTERS, Quarter, getLibraryItemName, getLibraryItemAmount,
} from "@/types/budget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Upload, ArrowLeft, Send, AlertTriangle, MessageSquare, Edit3 } from "lucide-react";
import { toast } from "sonner";

export default function BudgetEditPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const budget = MOCK_BUDGET_REQUESTS.find(b => b.id === id);

  const [title, setTitle] = useState("");
  const [fiscalYear, setFiscalYear] = useState("2026/27");
  const [lineItems, setLineItems] = useState<BudgetLineItem[]>([]);
  const [activeTab, setActiveTab] = useState<BudgetCategory>("CAPEX");
  const [revisionNote, setRevisionNote] = useState("");

  useEffect(() => {
    if (budget) {
      setTitle(budget.title);
      setFiscalYear(budget.fiscalYear);
      setLineItems([...budget.lineItems]);
    }
  }, [budget]);

  if (!budget) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Budget not found.</p>
        <Link to="/budgets" className="text-accent hover:underline text-sm mt-2 inline-block">Back to budgets</Link>
      </div>
    );
  }

  // Get revision comments from approval chain
  const revisionComments = budget.approvalChain
    .filter(step => step.action === "revision_requested" && step.comment)
    .map(step => ({
      stage: step.label,
      comment: step.comment!,
      approver: step.approvedBy || "Reviewer",
      date: step.approvedAt || "",
    }));

  const activeLibraryItems = MOCK_LIBRARY_ITEMS.filter(i => i.status === "ACTIVE" && i.category === activeTab);
  const tabs: BudgetCategory[] = ["CAPEX", "HR", "Direct Expense"];

  const addLineItem = (libraryItemId: string) => {
    const lib = MOCK_LIBRARY_ITEMS.find(i => i.id === libraryItemId);
    if (!lib) return;
    const name = getLibraryItemName(lib);
    const amount = getLibraryItemAmount(lib);
    const newItem: BudgetLineItem = {
      id: `edit-${Date.now()}`,
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
    setLineItems(prev => [...prev, newItem]);
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
  };

  const totalAmount = lineItems.reduce((sum, i) => sum + i.totalCost, 0);
  const originalTotal = budget.totalAmount;
  const amountDiff = totalAmount - originalTotal;

  const hasReplacementWithoutDocument = lineItems.some(
    i => i.remark === "REPLACEMENT" && !i.documentName
  );

  const handleResubmit = () => {
    if (!title.trim()) {
      toast.error("Please enter a budget title");
      return;
    }
    if (lineItems.length === 0) {
      toast.error("Please add at least one budget item");
      return;
    }
    if (hasReplacementWithoutDocument) {
      toast.error("All replacement items require a document upload");
      return;
    }
    toast.success("Budget revised and resubmitted successfully!");
    navigate("/budgets");
  };

  const itemsByCategory = (cat: BudgetCategory) => lineItems.filter(i => i.category === cat);

  // Track which items are original vs new/modified
  const originalItemIds = new Set(budget.lineItems.map(i => i.id));
  const isNewItem = (id: string) => !originalItemIds.has(id);
  const isModified = (item: BudgetLineItem) => {
    const original = budget.lineItems.find(o => o.id === item.id);
    if (!original) return false;
    return (
      original.quantity !== item.quantity ||
      original.unitCost !== item.unitCost ||
      original.remark !== item.remark ||
      original.purposeAndNecessity !== item.purposeAndNecessity ||
      original.desiredQuarterForProcurement !== item.desiredQuarterForProcurement
    );
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <Link to={`/budgets/${id}`} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="w-3 h-3" /> Back to budget detail
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-foreground">Edit Budget Request</h1>
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              <Edit3 className="w-3 h-3 mr-1" /> Revision
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Address revision comments and resubmit for approval
          </p>
        </div>
      </div>

      {/* Revision Comments Banner */}
      {revisionComments.length > 0 && (
        <div className="bg-accent/5 border border-accent/30 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Revision Requested</h3>
          </div>
          <div className="space-y-3">
            {revisionComments.map((rc, idx) => (
              <div key={idx} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{rc.approver}</span>
                  <span className="text-xs text-muted-foreground">• {rc.stage}</span>
                  {rc.date && <span className="text-xs text-muted-foreground">• {rc.date}</span>}
                </div>
                <p className="text-sm text-foreground bg-muted/50 rounded p-3 italic">"{rc.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revision Note */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Revision Response Note
        </Label>
        <Textarea
          value={revisionNote}
          onChange={e => setRevisionNote(e.target.value)}
          placeholder="Describe the changes you made in response to the revision request..."
          className="min-h-[80px]"
        />
      </div>

      {/* Basic Info */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
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

      {/* Amount Comparison */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Original Amount</p>
            <p className="text-lg font-display font-bold text-foreground mt-1">ETB {originalTotal.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Revised Amount</p>
            <p className="text-lg font-display font-bold text-foreground mt-1">ETB {totalAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Difference</p>
            <p className={`text-lg font-display font-bold mt-1 ${
              amountDiff > 0 ? "text-accent" : amountDiff < 0 ? "text-success" : "text-foreground"
            }`}>
              {amountDiff > 0 ? "+" : ""}{amountDiff.toLocaleString()} ETB
            </p>
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
        {activeTab === "CAPEX" ? (
          <div className="space-y-5">
            {CAPEX_SUB_CATEGORIES.map(sub => {
              const subItems = activeLibraryItems.filter(i => i.category === "CAPEX" && (i as import("@/types/budget").CapexLibraryItem).itemCategory === sub);
              if (subItems.length === 0) return null;
              return (
                <div key={sub}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{sub}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subItems.map(item => {
                      const capex = item as import("@/types/budget").CapexLibraryItem;
                      return (
                        <button key={item.id} onClick={() => addLineItem(item.id)}
                          className="text-left border border-border rounded-lg p-3 hover:border-accent/50 hover:bg-accent/5 transition-colors group">
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
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeLibraryItems.map(item => {
              const name = getLibraryItemName(item);
              const amount = getLibraryItemAmount(item);
              return (
                <button key={item.id} onClick={() => addLineItem(item.id)}
                  className="text-left border border-border rounded-lg p-3 hover:border-accent/50 hover:bg-accent/5 transition-colors group">
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

      {/* Line Items */}
      {lineItems.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Budget Items ({lineItems.length})</h3>
            <p className="text-sm font-display font-bold text-foreground">
              Total: ETB {totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="divide-y divide-border">
            {lineItems.map(item => {
              const itemIsNew = isNewItem(item.id);
              const itemIsModified = !itemIsNew && isModified(item);
              return (
                <div key={item.id} className={`p-5 space-y-3 ${
                  itemIsNew ? "bg-success/5 border-l-4 border-l-success" :
                  itemIsModified ? "bg-warning/5 border-l-4 border-l-warning" : ""
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.libraryItemName}</p>
                        <span className="text-xs text-muted-foreground">{item.category}{item.capexSubCategory ? ` · ${item.capexSubCategory}` : ""}</span>
                      </div>
                      {itemIsNew && (
                        <Badge variant="secondary" className="bg-success/10 text-success text-[10px]">NEW</Badge>
                      )}
                      {itemIsModified && (
                        <Badge variant="secondary" className="bg-warning/10 text-warning text-[10px]">MODIFIED</Badge>
                      )}
                    </div>
                    <button onClick={() => removeLineItem(item.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Remark</Label>
                      <Select value={item.remark} onValueChange={v => updateLineItem(item.id, { remark: v as BudgetItemRemark })}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {BUDGET_ITEM_REMARKS.map(r => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Desired Quarter</Label>
                      <Select value={item.desiredQuarterForProcurement} onValueChange={v => updateLineItem(item.id, { desiredQuarterForProcurement: v as Quarter })}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {QUARTERS.map(q => (
                            <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Quantity</Label>
                      <Input type="number" min={1} value={item.quantity}
                        onChange={e => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                        className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Unit Cost (ETB)</Label>
                      <Input type="number" min={0} value={item.unitCost}
                        onChange={e => updateLineItem(item.id, { unitCost: parseFloat(e.target.value) || 0 })}
                        className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Total</Label>
                      <div className="h-9 flex items-center text-xs font-medium text-foreground">
                        ETB {item.totalCost.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Purpose & Necessity</Label>
                    <Textarea value={item.purposeAndNecessity}
                      onChange={e => updateLineItem(item.id, { purposeAndNecessity: e.target.value })}
                      placeholder="Explain the purpose and necessity for this item..."
                      className="min-h-[60px] text-xs" />
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
                          <input type="file" className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) updateLineItem(item.id, { documentName: file.name, documentId: crypto.randomUUID() });
                            }} />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between bg-card border border-border rounded-lg p-5">
        <div>
          <p className="text-sm text-muted-foreground">
            {lineItems.length} item{lineItems.length !== 1 ? "s" : ""} ·{" "}
            <span className="font-display font-bold text-foreground">ETB {totalAmount.toLocaleString()}</span>
            {amountDiff !== 0 && (
              <span className={`ml-2 text-xs ${amountDiff > 0 ? "text-accent" : "text-success"}`}>
                ({amountDiff > 0 ? "+" : ""}{amountDiff.toLocaleString()} from original)
              </span>
            )}
          </p>
          {hasReplacementWithoutDocument && (
            <p className="text-xs text-accent mt-1">⚠ Some replacement items are missing required documents</p>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(`/budgets/${id}`)}>Cancel</Button>
          <Button onClick={handleResubmit}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
            disabled={hasReplacementWithoutDocument || lineItems.length === 0}>
            <Send className="w-4 h-4" /> Resubmit for Approval
          </Button>
        </div>
      </div>
    </div>
  );
}
