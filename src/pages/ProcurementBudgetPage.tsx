import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Package, Download, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProcurementLineItem, ProcurementCategory, DEPARTMENTS_LIST, DepartmentName, convertToBirr, USD_TO_BIRR_RATE } from "@/types/departmental";
import { MOCK_LIBRARY_ITEMS } from "@/data/mockData";
import { Currency, CURRENCIES, CapexLibraryItem } from "@/types/budget";
import { exportProcurementData, importFromExcel } from "@/lib/excelUtils";

export default function ProcurementBudgetPage() {
  const [items, setItems] = useState<ProcurementLineItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProcurementCategory>("IT");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capexLibrary = MOCK_LIBRARY_ITEMS.filter(i => i.category === "CAPEX" && i.status === "ACTIVE") as CapexLibraryItem[];

  const [formItem, setFormItem] = useState("");
  const [formDept, setFormDept] = useState<DepartmentName>("IT");
  const [formQty, setFormQty] = useState("1");
  const [formContract, setFormContract] = useState("");
  const [formPayment, setFormPayment] = useState("");
  const [formCurrency, setFormCurrency] = useState<Currency>("USD");

  const totalBudget = items.reduce((sum, i) => sum + i.totalRemainingBirr, 0);

  const handleAdd = () => {
    if (!formItem || !formContract) return;
    const contract = parseFloat(formContract);
    const payment = parseFloat(formPayment) || 0;
    const remaining = contract - payment;

    let remainingUSD: number, remainingBirr: number;
    if (formCurrency === "USD") {
      remainingUSD = remaining;
      remainingBirr = remaining * USD_TO_BIRR_RATE;
    } else if (formCurrency === "EURO") {
      remainingUSD = remaining * 140 / USD_TO_BIRR_RATE;
      remainingBirr = convertToBirr(remaining, "EURO");
    } else {
      remainingBirr = remaining;
      remainingUSD = remaining / USD_TO_BIRR_RATE;
    }

    const lib = capexLibrary.find(l => l.itemName === formItem);
    const newItem: ProcurementLineItem = {
      id: crypto.randomUUID(),
      category: activeTab,
      capexItemName: formItem,
      department: formDept,
      quantity: parseInt(formQty) || 1,
      unitPrice: lib?.unitPrice || 0,
      contractOrderAmount: contract,
      paymentIssued: payment,
      totalRemainingUSD: Math.round(remainingUSD * 100) / 100,
      totalRemainingBirr: Math.round(remainingBirr * 100) / 100,
      currency: formCurrency,
    };
    setItems(prev => [...prev, newItem]);
    setFormItem(""); setFormContract(""); setFormPayment(""); setFormQty("1");
    setDialogOpen(false);
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const handleImport = (file: File) => {
    importFromExcel<Record<string, unknown>>(file, (data) => {
      const imported: ProcurementLineItem[] = data.map(row => ({
        id: crypto.randomUUID(),
        category: (row["Category"] as ProcurementCategory) || activeTab,
        capexItemName: (row["Item"] as string) || "",
        department: (row["Department"] as DepartmentName) || "IT",
        quantity: Number(row["Quantity"]) || 1,
        unitPrice: 0,
        contractOrderAmount: Number(row["Contract Amount"]) || 0,
        paymentIssued: Number(row["Payment Issued"]) || 0,
        totalRemainingUSD: Number(row["Remaining (USD)"]) || 0,
        totalRemainingBirr: Number(row["Remaining (ETB)"]) || 0,
        currency: (row["Currency"] as Currency) || "USD",
      }));
      setItems(prev => [...prev, ...imported]);
    });
  };

  const tabItems = items.filter(i => i.category === activeTab);
  const tabTotal = tabItems.reduce((s, i) => s + i.totalRemainingBirr, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Procurement — CAPEX Budget</h1>
          <p className="text-sm text-muted-foreground mt-1">FY 2026/27 • IT and Non-IT CAPEX items</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportProcurementData(items)} className="gap-1">
              <Download className="w-3 h-3" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1">
              <Upload className="w-3 h-3" /> Import
            </Button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleImport(e.target.files[0]); e.target.value = ""; }} />
          </div>
          <Card className="border-accent/30 bg-accent/5 min-w-[220px]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Remaining (ETB)</p>
                <p className="text-xl font-bold text-foreground">{totalBudget.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as ProcurementCategory)}>
        <TabsList>
          <TabsTrigger value="IT">IT CAPEX</TabsTrigger>
          <TabsTrigger value="Non-IT">Non-IT CAPEX</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{activeTab} CAPEX Items ({tabItems.length})</CardTitle>
                <p className="text-xs text-muted-foreground">Total remaining: {tabTotal.toLocaleString()} ETB</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Plus className="w-4 h-4 mr-1" /> Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add {activeTab} CAPEX Item</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-sm font-medium text-foreground">CAPEX Item (from Library)</label>
                      <Select value={formItem} onValueChange={setFormItem}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select item" /></SelectTrigger>
                        <SelectContent>
                          {capexLibrary.map(lib => (
                            <SelectItem key={lib.id} value={lib.itemName}>{lib.itemName} — {lib.itemCategory}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Department</label>
                      <Select value={formDept} onValueChange={v => setFormDept(v as DepartmentName)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS_LIST.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground">Quantity</label>
                        <Input type="number" min="1" value={formQty} onChange={e => setFormQty(e.target.value)} className="mt-1" />
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
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground">Contract/Order Amount</label>
                        <Input type="number" value={formContract} onChange={e => setFormContract(e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Payment Issued</label>
                        <Input type="number" value={formPayment} onChange={e => setFormPayment(e.target.value)} className="mt-1" />
                      </div>
                    </div>
                    {formContract && (
                      <div className="bg-muted rounded-md p-3 text-xs space-y-1">
                        <p>Remaining: {((parseFloat(formContract) || 0) - (parseFloat(formPayment) || 0)).toLocaleString()} {formCurrency}</p>
                        {formCurrency !== "ETB" && (
                          <p>≈ {convertToBirr((parseFloat(formContract) || 0) - (parseFloat(formPayment) || 0), formCurrency).toLocaleString()} ETB</p>
                        )}
                        {formCurrency !== "USD" && (
                          <p>≈ {(((parseFloat(formContract) || 0) - (parseFloat(formPayment) || 0)) / (formCurrency === "ETB" ? USD_TO_BIRR_RATE : 1)).toLocaleString()} USD</p>
                        )}
                      </div>
                    )}
                    <Button onClick={handleAdd} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Add Item</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {tabItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No {activeTab} CAPEX items added.</p>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Contract</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Remaining (USD)</TableHead>
                        <TableHead className="text-right">Remaining (ETB)</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tabItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.capexItemName}</TableCell>
                          <TableCell>{item.department}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{item.contractOrderAmount.toLocaleString()} {item.currency}</TableCell>
                          <TableCell className="text-right">{item.paymentIssued.toLocaleString()} {item.currency}</TableCell>
                          <TableCell className="text-right">{item.totalRemainingUSD.toLocaleString()} USD</TableCell>
                          <TableCell className="text-right font-medium">{item.totalRemainingBirr.toLocaleString()} ETB</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
