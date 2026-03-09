import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MARKETING_BUDGET_GROUPS, MarketingBudgetGroup, MarketingLineItem, USD_TO_BIRR_RATE } from "@/types/departmental";
import { useAuth } from "@/contexts/AuthContext";

export default function MarketingBudgetPage() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<MarketingLineItem[]>([]);
  const [activeGroup, setActiveGroup] = useState<MarketingBudgetGroup>(MARKETING_BUDGET_GROUPS[0]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"new" | "transferred">("new");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("ETB");
  const [formRemark, setFormRemark] = useState("");

  const totalBudget = items.reduce((sum, i) => sum + i.amountBirr, 0);

  const groupItems = items.filter(i => i.group === activeGroup);
  const groupTotal = groupItems.reduce((sum, i) => sum + i.amountBirr, 0);

  const handleAdd = () => {
    if (!formName || !formAmount) return;
    const amount = parseFloat(formAmount);
    const amountBirr = formCurrency === "USD" ? amount * USD_TO_BIRR_RATE : amount;
    const newItem: MarketingLineItem = {
      id: crypto.randomUUID(),
      group: activeGroup,
      name: formName,
      type: formType,
      amount,
      currency: formCurrency,
      amountBirr,
      remark: formRemark || undefined,
    };
    setItems(prev => [...prev, newItem]);
    setFormName(""); setFormAmount(""); setFormRemark(""); setFormType("new");
    setDialogOpen(false);
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div className="space-y-6">
      {/* Header with live total */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Marketing Department Budget</h1>
          <p className="text-sm text-muted-foreground mt-1">FY 2026/27 • Marketing budget groups and items</p>
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

      {/* Groups Navigation */}
      <div className="flex gap-2 flex-wrap">
        {MARKETING_BUDGET_GROUPS.map(group => {
          const count = items.filter(i => i.group === group).length;
          return (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                activeGroup === group
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/30"
              }`}
            >
              {group} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Active Group Content */}
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
              <DialogHeader>
                <DialogTitle>Add Item to {activeGroup}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Item Name</label>
                  <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Billboard Ad Space" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Type</label>
                    <Select value={formType} onValueChange={v => setFormType(v as "new" | "transferred")}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="transferred">Transferred from Previous FY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Currency</label>
                    <Select value={formCurrency} onValueChange={setFormCurrency}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ETB">ETB (Birr)</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Amount</label>
                  <Input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} placeholder="0.00" className="mt-1" />
                  {formCurrency === "USD" && formAmount && (
                    <p className="text-xs text-muted-foreground mt-1">≈ {(parseFloat(formAmount) * USD_TO_BIRR_RATE).toLocaleString()} ETB</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Remark (optional)</label>
                  <Input value={formRemark} onChange={e => setFormRemark(e.target.value)} placeholder="Any notes..." className="mt-1" />
                </div>
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
                  <TableHead>Item Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Amount (ETB)</TableHead>
                  <TableHead>Remark</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant={item.type === "new" ? "default" : "secondary"} className={item.type === "new" ? "bg-accent/10 text-accent border-accent/20" : ""}>
                        {item.type === "new" ? "New" : "Transferred"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.amount.toLocaleString()} {item.currency}</TableCell>
                    <TableCell className="text-right font-medium">{item.amountBirr.toLocaleString()} ETB</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{item.remark || "—"}</TableCell>
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

      {/* Summary by group */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget Summary by Group</CardTitle>
          </CardHeader>
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
                  const gTotal = gItems.reduce((s, i) => s + i.amountBirr, 0);
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
