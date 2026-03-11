import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, DollarSign, Download, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MARKETING_BUDGET_GROUPS, MarketingBudgetGroup, MarketingLineItem, convertToBirr } from "@/types/departmental";
import { Currency, CURRENCIES } from "@/types/budget";
import { exportMarketingData, importFromExcel } from "@/lib/excelUtils";

export default function MarketingBudgetPage() {
  const [items, setItems] = useState<MarketingLineItem[]>([]);
  const [activeGroup, setActiveGroup] = useState<MarketingBudgetGroup>(MARKETING_BUDGET_GROUPS[0]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formDescription, setFormDescription] = useState("");
  const [formRemark, setFormRemark] = useState<"NEW" | "TRANSFER">("NEW");
  const [formQuantity, setFormQuantity] = useState("1");
  const [formUnitPrice, setFormUnitPrice] = useState("");
  const [formCurrency, setFormCurrency] = useState<Currency>("ETB");

  const totalBudget = items.reduce((sum, i) => sum + i.totalAmountBirr, 0);
  const groupItems = items.filter(i => i.group === activeGroup);
  const groupTotal = groupItems.reduce((sum, i) => sum + i.totalAmountBirr, 0);

  const handleAdd = () => {
    if (!formDescription || !formUnitPrice) return;
    const unitPrice = parseFloat(formUnitPrice);
    const quantity = parseInt(formQuantity) || 1;
    const totalAmount = unitPrice * quantity;
    const totalAmountBirr = convertToBirr(totalAmount, formCurrency);
    const newItem: MarketingLineItem = {
      id: crypto.randomUUID(),
      group: activeGroup,
      description: formDescription,
      quantity,
      unitPrice,
      totalAmount,
      currency: formCurrency,
      totalAmountBirr,
      remark: formRemark,
    };
    setItems(prev => [...prev, newItem]);
    setFormDescription(""); setFormUnitPrice(""); setFormQuantity("1"); setFormRemark("NEW");
    setDialogOpen(false);
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const handleImport = (file: File) => {
    importFromExcel<Record<string, unknown>>(file, (data) => {
      const imported: MarketingLineItem[] = data.map(row => ({
        id: crypto.randomUUID(),
        group: (row["Group"] as MarketingBudgetGroup) || activeGroup,
        description: (row["Description"] as string) || "",
        quantity: Number(row["Quantity"]) || 1,
        unitPrice: Number(row["Unit Price"]) || 0,
        totalAmount: Number(row["Unit Price"]) * (Number(row["Quantity"]) || 1),
        currency: (row["Currency"] as Currency) || "ETB",
        totalAmountBirr: Number(row["Total (ETB)"]) || 0,
        remark: (row["Remark"] as "NEW" | "TRANSFER") || "NEW",
      }));
      setItems(prev => [...prev, ...imported]);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Marketing Department Budget</h1>
          <p className="text-sm text-muted-foreground mt-1">FY 2026/27 • Marketing budget groups and items</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportMarketingData(items)} className="gap-1">
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
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Marketing Budget</p>
                <p className="text-xl font-bold text-foreground">
                  {totalBudget.toLocaleString("en-ET", { minimumFractionDigits: 2 })} <span className="text-xs text-muted-foreground">ETB</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {MARKETING_BUDGET_GROUPS.map(group => {
          const count = items.filter(i => i.group === group).length;
          return (
            <button key={group} onClick={() => setActiveGroup(group)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                activeGroup === group
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/30"
              }`}>
              {group} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">{activeGroup}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {groupItems.length} items • Total: {groupTotal.toLocaleString()} ETB
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Item to {activeGroup}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Input value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="e.g. Billboard Ad Space" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Remark</label>
                    <Select value={formRemark} onValueChange={v => setFormRemark(v as "NEW" | "TRANSFER")}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="TRANSFER">Transfer from Previous FY</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <label className="text-sm font-medium text-foreground">Quantity</label>
                    <Input type="number" min="1" value={formQuantity} onChange={e => setFormQuantity(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Unit Price</label>
                    <Input type="number" value={formUnitPrice} onChange={e => setFormUnitPrice(e.target.value)} placeholder="0.00" className="mt-1" />
                  </div>
                </div>
                {formUnitPrice && formCurrency !== "ETB" && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {convertToBirr(parseFloat(formUnitPrice) * (parseInt(formQuantity) || 1), formCurrency).toLocaleString()} ETB total
                  </p>
                )}
                <Button onClick={handleAdd} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Add Item</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {groupItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No items added to this group yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Remark</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Total (ETB)</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell>
                      <Badge variant={item.remark === "NEW" ? "default" : "secondary"}
                        className={item.remark === "NEW" ? "bg-accent/10 text-accent border-accent/20" : ""}>
                        {item.remark === "NEW" ? "New" : "Transfer"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.unitPrice.toLocaleString()} {item.currency}</TableCell>
                    <TableCell className="text-right">{item.totalAmount.toLocaleString()} {item.currency}</TableCell>
                    <TableCell className="text-right font-medium">{item.totalAmountBirr.toLocaleString()} ETB</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Budget Summary by Group</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total (ETB)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MARKETING_BUDGET_GROUPS.filter(g => items.some(i => i.group === g)).map(group => {
                  const gItems = items.filter(i => i.group === group);
                  const gTotal = gItems.reduce((s, i) => s + i.totalAmountBirr, 0);
                  return (
                    <TableRow key={group}>
                      <TableCell className="font-medium">{group}</TableCell>
                      <TableCell className="text-right">{gItems.length}</TableCell>
                      <TableCell className="text-right font-medium">{gTotal.toLocaleString()} ETB</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Grand Total</TableCell>
                  <TableCell className="text-right">{items.length}</TableCell>
                  <TableCell className="text-right">{totalBudget.toLocaleString()} ETB</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
