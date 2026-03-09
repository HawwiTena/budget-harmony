import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Monitor, Check, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ITBudgetLineItem, ITBudgetCategory, USD_TO_BIRR_RATE } from "@/types/departmental";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const IT_CATEGORIES: ITBudgetCategory[] = ["Software", "RLF", "Service Fees"];

// Mock departments under IT chiefs
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

  const [items, setItems] = useState<ITBudgetLineItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ITBudgetCategory>("Software");
  const [viewMode, setViewMode] = useState<"submit" | "consolidated">(isChief ? "consolidated" : "submit");

  // Form
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");
  const [formRemark, setFormRemark] = useState("");
  const [formDept, setFormDept] = useState(IT_SUB_DEPARTMENTS[0]);

  // Mock consolidated items from sub-departments
  const [consolidatedItems, setConsolidatedItems] = useState<ITBudgetLineItem[]>([
    { id: "it-c1", category: "Software", name: "Oracle DB License", amount: 25000, currency: "USD", amountBirr: 25000 * USD_TO_BIRR_RATE, vat15: Math.round(25000 * USD_TO_BIRR_RATE / 0.85 * 0.15), totalWithVat: Math.round(25000 * USD_TO_BIRR_RATE + 25000 * USD_TO_BIRR_RATE / 0.85 * 0.15), remark: "Annual license renewal", submittedByDepartment: "Database Administration", status: "pending" },
    { id: "it-c2", category: "Service Fees", name: "AWS Cloud Services", amount: 18000, currency: "USD", amountBirr: 18000 * USD_TO_BIRR_RATE, vat15: Math.round(18000 * USD_TO_BIRR_RATE / 0.85 * 0.15), totalWithVat: Math.round(18000 * USD_TO_BIRR_RATE + 18000 * USD_TO_BIRR_RATE / 0.85 * 0.15), remark: "Monthly hosting", submittedByDepartment: "Infrastructure & Operations", status: "pending" },
    { id: "it-c3", category: "RLF", name: "Microsoft 365 E3", amount: 12000, currency: "USD", amountBirr: 12000 * USD_TO_BIRR_RATE, vat15: Math.round(12000 * USD_TO_BIRR_RATE / 0.85 * 0.15), totalWithVat: Math.round(12000 * USD_TO_BIRR_RATE + 12000 * USD_TO_BIRR_RATE / 0.85 * 0.15), remark: "500 seats", submittedByDepartment: "Application Development", status: "pending" },
  ]);

  const calcVat = (amountBirr: number) => {
    const base = amountBirr / 0.85;
    return Math.round(base * 0.15);
  };

  const handleAdd = () => {
    if (!formName || !formAmount) return;
    const amount = parseFloat(formAmount);
    const amountBirr = formCurrency === "USD" ? amount * USD_TO_BIRR_RATE : amount;
    const vat15 = calcVat(amountBirr);
    const totalWithVat = amountBirr + vat15;

    const newItem: ITBudgetLineItem = {
      id: crypto.randomUUID(),
      category: activeCategory,
      name: formName,
      amount,
      currency: formCurrency,
      amountBirr,
      vat15,
      totalWithVat,
      remark: formRemark || undefined,
      submittedByDepartment: formDept,
      status: "pending",
    };
    setItems(prev => [...prev, newItem]);
    setFormName(""); setFormAmount(""); setFormRemark("");
    setDialogOpen(false);
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const handleApproveItem = (id: string) => {
    setConsolidatedItems(prev => prev.map(i => i.id === id ? { ...i, status: "approved" as const } : i));
    toast({ title: "Item Approved" });
  };

  const handleRevisionItem = (id: string) => {
    setConsolidatedItems(prev => prev.map(i => i.id === id ? { ...i, status: "revision_requested" as const } : i));
    toast({ title: "Revision Requested", description: "Item returned to submitting department" });
  };

  const catItems = viewMode === "submit"
    ? items.filter(i => i.category === activeCategory)
    : consolidatedItems.filter(i => i.category === activeCategory);

  const allDisplayItems = viewMode === "submit" ? items : consolidatedItems;
  const totalBirr = allDisplayItems.reduce((s, i) => s + i.totalWithVat, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">IT Department Budget</h1>
          <p className="text-sm text-muted-foreground mt-1">FY 2026/27 • Software, RLF & Service Fees with VAT</p>
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

      {/* View mode toggle for chiefs */}
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
          {IT_CATEGORIES.map(c => <TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}
        </TabsList>

        <TabsContent value={activeCategory}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{activeCategory} ({catItems.length})</CardTitle>
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
                    <DialogHeader><DialogTitle>Add {activeCategory} Item</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-sm font-medium text-foreground">Item Name</label>
                        <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Jira Cloud License" className="mt-1" />
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
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-foreground">Amount</label>
                          <Input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground">Currency</label>
                          <Select value={formCurrency} onValueChange={setFormCurrency}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="ETB">ETB</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {formAmount && (
                        <div className="bg-muted rounded-md p-3 text-xs space-y-1">
                          {(() => {
                            const amt = parseFloat(formAmount) || 0;
                            const birr = formCurrency === "USD" ? amt * USD_TO_BIRR_RATE : amt;
                            const vat = calcVat(birr);
                            return (
                              <>
                                <p>Birr Fee: {birr.toLocaleString()} ETB</p>
                                <p>VAT 15%: {vat.toLocaleString()} ETB</p>
                                <p className="font-bold">Total (incl. VAT): {(birr + vat).toLocaleString()} ETB</p>
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
                <p className="text-sm text-muted-foreground text-center py-8">No {activeCategory} items.</p>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Birr Fee</TableHead>
                        <TableHead className="text-right">VAT 15%</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Remark</TableHead>
                        {viewMode === "consolidated" && <TableHead>Status</TableHead>}
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {catItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-xs">{item.submittedByDepartment}</TableCell>
                          <TableCell className="text-right">{item.amount.toLocaleString()} {item.currency}</TableCell>
                          <TableCell className="text-right">{item.amountBirr.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.vat15.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-bold">{item.totalWithVat.toLocaleString()}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{item.remark || "—"}</TableCell>
                          {viewMode === "consolidated" && (
                            <TableCell>
                              <Badge variant="secondary" className={
                                item.status === "approved" ? "bg-success/10 text-success" :
                                item.status === "revision_requested" ? "bg-accent/10 text-accent" :
                                "bg-warning/10 text-warning"
                              }>
                                {item.status === "approved" ? "Approved" : item.status === "revision_requested" ? "Revision" : "Pending"}
                              </Badge>
                            </TableCell>
                          )}
                          <TableCell>
                            {viewMode === "submit" ? (
                              <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                            ) : item.status === "pending" ? (
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
