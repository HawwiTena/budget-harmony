import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Monitor, Check, RotateCcw, Download, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ITBudgetLineItem, ITBudgetCategory, IT_BUDGET_CATEGORIES, convertToBirr } from "@/types/departmental";
import { Currency, CURRENCIES } from "@/types/budget";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { exportITData, importFromExcel } from "@/lib/excelUtils";

const IT_SUB_DEPARTMENTS = [
  "Application Development",
  "Infrastructure & Operations",
  "IT Security",
  "Database Administration",
  "Digital Banking",
  "Core Banking",
  "Network & Communications",
];

export default function ITBudgetPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const isChief = currentUser.role === "department_chief";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<ITBudgetLineItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ITBudgetCategory>("SOFTWARE");
  const [viewMode, setViewMode] = useState<"submit" | "consolidated">(isChief ? "consolidated" : "submit");

  const [formDescription, setFormDescription] = useState("");
  const [formQuantity, setFormQuantity] = useState("1");
  const [formUnitPrice, setFormUnitPrice] = useState("");
  const [formCurrency, setFormCurrency] = useState<Currency>("USD");
  const [formRemark, setFormRemark] = useState("");
  const [formDept, setFormDept] = useState(IT_SUB_DEPARTMENTS[0]);

  const calcVatFields = (birrFee: number) => {
    const base = birrFee / 0.85;
    const vat15 = Math.round(base * 0.15);
    return { vat15, totalWithVat: birrFee + vat15 };
  };

  const [consolidatedItems, setConsolidatedItems] = useState<ITBudgetLineItem[]>(() => {
    const makeItem = (id: string, cat: ITBudgetCategory, desc: string, qty: number, price: number, curr: Currency, remark: string, dept: string): ITBudgetLineItem => {
      const totalAmount = qty * price;
      const birrFee = convertToBirr(totalAmount, curr);
      const { vat15, totalWithVat } = calcVatFields(birrFee);
      return { id, category: cat, description: desc, quantity: qty, unitPrice: price, totalAmount, currency: curr, birrFee, vat15, totalWithVat, remark, submittedByDepartment: dept, status: "PENDING" };
    };
    return [
      makeItem("it-c1", "SOFTWARE", "Oracle DB License", 1, 25000, "USD", "Annual license renewal", "Database Administration"),
      makeItem("it-c2", "SERVICEFEE", "AWS Cloud Services", 1, 18000, "USD", "Monthly hosting", "Infrastructure & Operations"),
      makeItem("it-c3", "RLF", "Microsoft 365 E3", 500, 24, "USD", "500 seats", "Application Development"),
    ];
  });

  const handleAdd = () => {
    if (!formDescription || !formUnitPrice) return;
    const unitPrice = parseFloat(formUnitPrice);
    const quantity = parseInt(formQuantity) || 1;
    const totalAmount = unitPrice * quantity;
    const birrFee = convertToBirr(totalAmount, formCurrency);
    const { vat15, totalWithVat } = calcVatFields(birrFee);

    const newItem: ITBudgetLineItem = {
      id: crypto.randomUUID(),
      category: activeCategory,
      description: formDescription,
      quantity,
      unitPrice,
      totalAmount,
      currency: formCurrency,
      birrFee,
      vat15,
      totalWithVat,
      remark: formRemark || undefined,
      submittedByDepartment: formDept,
      status: "PENDING",
    };
    setItems(prev => [...prev, newItem]);
    setFormDescription(""); setFormUnitPrice(""); setFormQuantity("1"); setFormRemark("");
    setDialogOpen(false);
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const handleApproveItem = (id: string) => {
    setConsolidatedItems(prev => prev.map(i => i.id === id ? { ...i, status: "APPROVED" as const } : i));
    toast({ title: "Item Approved" });
  };

  const handleRevisionItem = (id: string) => {
    setConsolidatedItems(prev => prev.map(i => i.id === id ? { ...i, status: "REVISION_REQUIRED" as const } : i));
    toast({ title: "Revision Requested", description: "Item returned to submitting department" });
  };

  const allDisplayItems = viewMode === "submit" ? items : consolidatedItems;
  const catItems = allDisplayItems.filter(i => i.category === activeCategory);
  const totalBirr = allDisplayItems.reduce((s, i) => s + i.totalWithVat, 0);

  const handleImport = (file: File) => {
    importFromExcel<Record<string, unknown>>(file, (data) => {
      const imported: ITBudgetLineItem[] = data.map(row => {
        const birrFee = Number(row["Birr Fee"]) || 0;
        const { vat15, totalWithVat } = calcVatFields(birrFee);
        return {
          id: crypto.randomUUID(),
          category: (row["Category"] as ITBudgetCategory) || activeCategory,
          description: (row["Description"] as string) || "",
          quantity: Number(row["Quantity"]) || 1,
          unitPrice: Number(row["Unit Price"]) || 0,
          totalAmount: Number(row["Unit Price"]) * (Number(row["Quantity"]) || 1),
          currency: (row["Currency"] as Currency) || "USD",
          birrFee,
          vat15,
          totalWithVat,
          remark: (row["Remark"] as string) || undefined,
          submittedByDepartment: (row["Department"] as string) || IT_SUB_DEPARTMENTS[0],
          status: "PENDING" as const,
        };
      });
      setItems(prev => [...prev, ...imported]);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">IT Department Budget</h1>
          <p className="text-sm text-muted-foreground mt-1">FY 2026/27 • Software, RLF & Service Fees with VAT</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportITData(allDisplayItems)} className="gap-1">
              <Download className="w-3 h-3" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1">
              <Upload className="w-3 h-3" /> Import
            </Button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleImport(e.target.files[0]); e.target.value = ""; }} />
          </div>
          <Card className="border-accent/30 bg-accent/5 min-w-[240px]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total IT Budget (incl. VAT)</p>
                <p className="text-xl font-bold text-foreground">{totalBirr.toLocaleString()} <span className="text-xs text-muted-foreground">ETB</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isChief && (
        <div className="flex gap-2">
          <Button variant={viewMode === "consolidated" ? "default" : "outline"} size="sm" onClick={() => setViewMode("consolidated")}>
            Consolidated View
          </Button>
          <Button variant={viewMode === "submit" ? "default" : "outline"} size="sm" onClick={() => setViewMode("submit")}>
            Submit Own Items
          </Button>
        </div>
      )}

      <Tabs value={activeCategory} onValueChange={v => setActiveCategory(v as ITBudgetCategory)}>
        <TabsList>
          {IT_BUDGET_CATEGORIES.map(c => <TabsTrigger key={c.value} value={c.value}>{c.label}</TabsTrigger>)}
        </TabsList>

        <TabsContent value={activeCategory}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{IT_BUDGET_CATEGORIES.find(c => c.value === activeCategory)?.label} ({catItems.length})</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Total: {catItems.reduce((s, i) => s + i.totalWithVat, 0).toLocaleString()} ETB (incl. VAT)
                </p>
              </div>
              {viewMode === "submit" && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Plus className="w-4 h-4 mr-1" /> Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add {IT_BUDGET_CATEGORIES.find(c => c.value === activeCategory)?.label} Item</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-sm font-medium text-foreground">Description</label>
                        <Input value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="e.g. Jira Cloud License" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Department</label>
                        <Select value={formDept} onValueChange={setFormDept}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {IT_SUB_DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-sm font-medium text-foreground">Quantity</label>
                          <Input type="number" min="1" value={formQuantity} onChange={e => setFormQuantity(e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground">Unit Price</label>
                          <Input type="number" value={formUnitPrice} onChange={e => setFormUnitPrice(e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground">Currency</label>
                          <Select value={formCurrency} onValueChange={v => setFormCurrency(v as Currency)}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {CURRENCIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {formUnitPrice && (
                        <div className="bg-muted rounded-md p-3 text-xs space-y-1">
                          {(() => {
                            const qty = parseInt(formQuantity) || 1;
                            const total = (parseFloat(formUnitPrice) || 0) * qty;
                            const birr = convertToBirr(total, formCurrency);
                            const { vat15, totalWithVat } = calcVatFields(birr);
                            return (
                              <>
                                <p>Birr Fee: {birr.toLocaleString()} ETB</p>
                                <p>VAT 15%: {vat15.toLocaleString()} ETB</p>
                                <p className="font-bold">Total (incl. VAT): {totalWithVat.toLocaleString()} ETB</p>
                              </>
                            );
                          })()}
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-foreground">Remark</label>
                        <Input value={formRemark} onChange={e => setFormRemark(e.target.value)} className="mt-1" />
                      </div>
                      <Button onClick={handleAdd} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Add Item</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {catItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No items.</p>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Birr Fee</TableHead>
                        <TableHead className="text-right">VAT 15%</TableHead>
                        <TableHead className="text-right">Total (incl. VAT)</TableHead>
                        <TableHead>Remark</TableHead>
                        {viewMode === "consolidated" && <TableHead>Status</TableHead>}
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {catItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell className="text-xs">{item.submittedByDepartment}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{item.unitPrice.toLocaleString()} {item.currency}</TableCell>
                          <TableCell className="text-right">{item.totalAmount.toLocaleString()} {item.currency}</TableCell>
                          <TableCell className="text-right">{item.birrFee.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.vat15.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-bold">{item.totalWithVat.toLocaleString()}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{item.remark || "—"}</TableCell>
                          {viewMode === "consolidated" && (
                            <TableCell>
                              <Badge variant="secondary" className={
                                item.status === "APPROVED" ? "bg-success/10 text-success" :
                                item.status === "REVISION_REQUIRED" ? "bg-accent/10 text-accent" :
                                "bg-warning/10 text-warning"
                              }>
                                {item.status === "APPROVED" ? "Approved" : item.status === "REVISION_REQUIRED" ? "Revision" : "Pending"}
                              </Badge>
                            </TableCell>
                          )}
                          <TableCell>
                            {viewMode === "submit" ? (
                              <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                            ) : item.status === "PENDING" ? (
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleApproveItem(item.id)} title="Approve">
                                  <Check className="w-4 h-4 text-success" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleRevisionItem(item.id)} title="Request Revision">
                                  <RotateCcw className="w-4 h-4 text-accent" />
                                </Button>
                              </div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
