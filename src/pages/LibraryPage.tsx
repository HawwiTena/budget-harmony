import { useState } from "react";
import { MOCK_LIBRARY_ITEMS } from "@/data/mockData";
import {
  LibraryItem, BudgetCategory, LibraryItemStatus, CapexSubCategory, CAPEX_SUB_CATEGORIES,
  CapexLibraryItem, HRLibraryItem, DirectExpenseLibraryItem,
  getLibraryItemName, getLibraryItemAmount,
  JOB_GRADES, JOB_CATEGORIES, JobGrade, JobCategory, LIBRARY_STATUS_LABELS,
} from "@/types/budget";
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
    const name = getLibraryItemName(i);
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || i.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const pendingItems = items.filter(i =>
    i.status === "PENDING_CREATE" || i.status === "PENDING_EDIT" || i.status === "PENDING_DEACTIVATE"
  );

  const handleSave = (item: LibraryItem) => {
    if (editItem) {
      setItems(prev => prev.map(i =>
        i.id === editItem.id
          ? { ...item, id: editItem.id, status: isOfficer ? "PENDING_EDIT" as LibraryItemStatus : i.status, updatedAt: new Date().toISOString().split("T")[0] }
          : i
      ));
      toast.success(isOfficer ? "Changes submitted for approval" : "Item updated");
    } else {
      const newItem = {
        ...item,
        id: `lib-${Date.now()}`,
        status: (isOfficer ? "PENDING_CREATE" : "ACTIVE") as LibraryItemStatus,
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
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      if (i.status === "PENDING_DEACTIVATE") return { ...i, status: "INACTIVE" as LibraryItemStatus, approvedBy: currentUser.id };
      return { ...i, status: "ACTIVE" as LibraryItemStatus, approvedBy: currentUser.id };
    }));
    toast.success("Item approved");
  };

  const handleReject = (id: string) => {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, status: "REJECTED" as LibraryItemStatus } : i
    ));
    toast.success("Item rejected");
  };

  const handleDeactivate = (id: string) => {
    if (isOfficer) {
      setItems(prev => prev.map(i =>
        i.id === id ? { ...i, status: "PENDING_DEACTIVATE" as LibraryItemStatus } : i
      ));
      toast.success("Deactivation submitted for approval");
    } else {
      setItems(prev => prev.map(i =>
        i.id === id ? { ...i, status: "INACTIVE" as LibraryItemStatus } : i
      ));
      toast.success("Item deactivated");
    }
  };

  const statusIcon = (status: LibraryItemStatus) => {
    switch (status) {
      case "ACTIVE": return <Check className="w-3.5 h-3.5 text-success" />;
      case "INACTIVE": return <Ban className="w-3.5 h-3.5 text-muted-foreground" />;
      case "PENDING_CREATE":
      case "PENDING_EDIT":
      case "PENDING_DEACTIVATE":
        return <Clock className="w-3.5 h-3.5 text-warning" />;
      case "REJECTED": return <X className="w-3.5 h-3.5 text-destructive" />;
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
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
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
      {isDirector && pendingItems.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning" />
            Pending Your Approval ({pendingItems.length})
          </h2>
          <div className="space-y-2">
            {pendingItems.map(item => (
              <div key={item.id} className="bg-card border border-warning/20 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{getLibraryItemName(item)}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.category} · {LIBRARY_STATUS_LABELS[item.status]}
                    {item.category === "CAPEX" && ` · ETB ${(item as CapexLibraryItem).unitPrice.toLocaleString()}`}
                  </p>
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
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Details</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{getLibraryItemName(item)}</p>
                  {item.category === "CAPEX" && (
                    <p className="text-xs text-muted-foreground">{(item as CapexLibraryItem).itemCategory} · {(item as CapexLibraryItem).unitOfMeasurement}</p>
                  )}
                  {item.category === "HR" && (
                    <p className="text-xs text-muted-foreground">{(item as HRLibraryItem).jobGrade} · {(item as HRLibraryItem).jobCategory}</p>
                  )}
                  {item.category === "Direct Expense" && (
                    <p className="text-xs text-muted-foreground">{(item as DirectExpenseLibraryItem).expenseCategory}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-muted-foreground">{item.category}</span>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {item.category === "CAPEX" && `ETB ${(item as CapexLibraryItem).unitPrice.toLocaleString()}`}
                  {item.category === "HR" && `ETB ${getLibraryItemAmount(item).toLocaleString()} (total pkg)`}
                  {item.category === "Direct Expense" && "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    {statusIcon(item.status)} {LIBRARY_STATUS_LABELS[item.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {(isOfficer || isDirector) && item.status === "ACTIVE" && (
                      <>
                        <Button size="sm" variant="ghost" className="h-7 text-xs"
                          onClick={() => { setEditItem(item); setIsDialogOpen(true); }}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleDeactivate(item.id)}>
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
  onSave: (data: LibraryItem) => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState<BudgetCategory>(item?.category || "CAPEX");

  // CAPEX fields
  const [itemName, setItemName] = useState(item?.category === "CAPEX" ? item.itemName : "");
  const [itemCategory, setItemCategory] = useState<CapexSubCategory>(
    item?.category === "CAPEX" ? item.itemCategory : "Computer & Related"
  );
  const [unitOfMeasurement, setUnitOfMeasurement] = useState(
    item?.category === "CAPEX" ? item.unitOfMeasurement : "Unit"
  );
  const [unitPrice, setUnitPrice] = useState(
    item?.category === "CAPEX" ? item.unitPrice : 0
  );

  // HR fields
  const [jobTitle, setJobTitle] = useState(item?.category === "HR" ? item.jobTitle : "");
  const [jobGrade, setJobGrade] = useState<JobGrade>(item?.category === "HR" ? item.jobGrade : "Grade_I");
  const [jobCategory, setJobCategory] = useState<JobCategory>(item?.category === "HR" ? item.jobCategory : "OPERATIONAL");
  const [baseSalary, setBaseSalary] = useState(item?.category === "HR" ? item.baseSalary : 0);
  const [cashIndemnity, setCashIndemnity] = useState(item?.category === "HR" ? item.cashIndemnity : 0);
  const [hardshipAllowance, setHardshipAllowance] = useState(item?.category === "HR" ? item.hardshipAllowance : 0);
  const [laundryAllowance, setLaundryAllowance] = useState(item?.category === "HR" ? item.laundryAllowance : 0);
  const [transportationAllowance, setTransportationAllowance] = useState(item?.category === "HR" ? item.transportationAllowance : 0);
  const [vehicleAllowance, setVehicleAllowance] = useState(item?.category === "HR" ? item.vehicleAllowance : 0);
  const [positionAllowance, setPositionAllowance] = useState(item?.category === "HR" ? item.positionAllowance : 0);
  const [mobileAllowance, setMobileAllowance] = useState(item?.category === "HR" ? item.mobileAllowance : 0);

  // Direct Expense fields
  const [expenseCategory, setExpenseCategory] = useState(item?.category === "Direct Expense" ? item.expenseCategory : "");
  const [description, setDescription] = useState(item?.category === "Direct Expense" ? item.description : "");

  const totalHRPackage = baseSalary + cashIndemnity + hardshipAllowance + laundryAllowance +
    transportationAllowance + vehicleAllowance + positionAllowance + mobileAllowance;

  const handleSave = () => {
    const base = {
      id: item?.id || "",
      createdBy: item?.createdBy || "",
      createdAt: item?.createdAt || "",
      updatedAt: item?.updatedAt || "",
      status: item?.status || ("PENDING_CREATE" as LibraryItemStatus),
      approvedBy: item?.approvedBy,
    };

    if (category === "CAPEX") {
      onSave({ ...base, category: "CAPEX", itemName, itemCategory, unitOfMeasurement, unitPrice } as CapexLibraryItem);
    } else if (category === "HR") {
      onSave({ ...base, category: "HR", jobTitle, jobGrade, jobCategory, baseSalary, cashIndemnity, hardshipAllowance, laundryAllowance, transportationAllowance, vehicleAllowance, positionAllowance, mobileAllowance } as HRLibraryItem);
    } else {
      onSave({ ...base, category: "Direct Expense", expenseCategory, description } as DirectExpenseLibraryItem);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Category</Label>
        <Select value={category} onValueChange={v => setCategory(v as BudgetCategory)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="CAPEX">CAPEX</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Direct Expense">Direct Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {category === "CAPEX" && (
        <>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Item Name</Label>
            <Input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Desktop Computer" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Item Category</Label>
            <Select value={itemCategory} onValueChange={v => setItemCategory(v as CapexSubCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CAPEX_SUB_CATEGORIES.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Unit of Measurement</Label>
              <Input value={unitOfMeasurement} onChange={e => setUnitOfMeasurement(e.target.value)} placeholder="e.g. Unit, Set, Piece" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Unit Price (ETB)</Label>
              <Input type="number" value={unitPrice} onChange={e => setUnitPrice(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        </>
      )}

      {category === "HR" && (
        <>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Job Title</Label>
            <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Loan Officer" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Job Grade</Label>
              <Select value={jobGrade} onValueChange={v => setJobGrade(v as JobGrade)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_GRADES.map(g => <SelectItem key={g} value={g}>{g.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Job Category</Label>
              <Select value={jobCategory} onValueChange={v => setJobCategory(v as JobCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Base Salary</Label>
              <Input type="number" value={baseSalary} onChange={e => setBaseSalary(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Cash Indemnity</Label>
              <Input type="number" value={cashIndemnity} onChange={e => setCashIndemnity(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Hardship Allowance</Label>
              <Input type="number" value={hardshipAllowance} onChange={e => setHardshipAllowance(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Laundry Allowance</Label>
              <Input type="number" value={laundryAllowance} onChange={e => setLaundryAllowance(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Transportation Allowance</Label>
              <Input type="number" value={transportationAllowance} onChange={e => setTransportationAllowance(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Vehicle Allowance</Label>
              <Input type="number" value={vehicleAllowance} onChange={e => setVehicleAllowance(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Position Allowance</Label>
              <Input type="number" value={positionAllowance} onChange={e => setPositionAllowance(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Mobile Allowance</Label>
              <Input type="number" value={mobileAllowance} onChange={e => setMobileAllowance(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="bg-muted rounded-md p-3">
            <p className="text-sm font-medium text-foreground">Total Package: ETB {totalHRPackage.toLocaleString()}</p>
          </div>
        </>
      )}

      {category === "Direct Expense" && (
        <>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Expense Category</Label>
            <Input value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)} placeholder="e.g. Rent, Utilities" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description of the expense" />
          </div>
        </>
      )}

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
          {item ? "Update" : "Create"}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
