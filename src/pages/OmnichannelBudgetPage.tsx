import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OmnichannelFeeItem, OmnichannelToWhom, OMNICHANNEL_PROVIDERS, convertToBirr } from "@/types/departmental";
import { Currency, CURRENCIES } from "@/types/budget";

export default function OmnichannelBudgetPage() {
  const [items, setItems] = useState<OmnichannelFeeItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formToWhom, setFormToWhom] = useState<OmnichannelToWhom>("MASTERCARD");
  const [formDescription, setFormDescription] = useState("");
  const [formDailyWeekly, setFormDailyWeekly] = useState("");
  const [formMonthlyQuarterly, setFormMonthlyQuarterly] = useState("");
  const [formQuantity, setFormQuantity] = useState("1");
  const [formUnitPrice, setFormUnitPrice] = useState("");
  const [formCurrency, setFormCurrency] = useState<Currency>("USD");

  const totalBirr = items.reduce((s, i) => s + i.totalAmountBirr, 0);

  const handleAdd = () => {
    if (!formDescription) return;
    const unitPrice = parseFloat(formUnitPrice) || 0;
    const quantity = parseInt(formQuantity) || 1;
    const dailyWeeklyFee = parseFloat(formDailyWeekly) || 0;
    const monthlyQuarterlyFee = parseFloat(formMonthlyQuarterly) || 0;
    const totalAmount = unitPrice * quantity;
    const totalAmountBirr = convertToBirr(totalAmount, formCurrency);

    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      toWhom: formToWhom,
      description: formDescription,
      dailyWeeklyFee,
      monthlyQuarterlyFee,
      quantity,
      unitPrice,
      totalAmount,
      currency: formCurrency,
      totalAmountBirr,
    }]);
    setFormDescription(""); setFormDailyWeekly(""); setFormMonthlyQuarterly("");
    setFormUnitPrice(""); setFormQuantity("1");
    setDialogOpen(false);
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Omnichannel — Card Fees Budget</h1>
          <p className="text-sm text-muted-foreground mt-1">FY 2026/27 • MasterCard, Visa & EthSwitch fees</p>
        </div>
        <Card className="border-accent/30 bg-accent/5 min-w-[220px]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Fees (ETB)</p>
              <p className="text-xl font-bold text-foreground">{totalBirr.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider cards */}
      <div className="grid grid-cols-3 gap-4">
        {OMNICHANNEL_PROVIDERS.map(provider => {
          const pItems = items.filter(i => i.toWhom === provider.value);
          const pTotal = pItems.reduce((s, i) => s + i.totalAmountBirr, 0);
          return (
            <Card key={provider.value}>
              <CardContent className="p-4">
                <h3 className="font-medium text-foreground">{provider.label}</h3>
                <p className="text-xs text-muted-foreground">{pItems.length} fee entries</p>
                <p className="text-lg font-bold mt-2">{pTotal.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">ETB</span></p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">All Fee Entries ({items.length})</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="w-4 h-4 mr-1" /> Add Fee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Fee Entry</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium text-foreground">To Whom</label>
                  <Select value={formToWhom} onValueChange={v => setFormToWhom(v as OmnichannelToWhom)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OMNICHANNEL_PROVIDERS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Input value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Fee description..." className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Daily/Weekly Fee</label>
                    <Input type="number" value={formDailyWeekly} onChange={e => setFormDailyWeekly(e.target.value)} placeholder="0.00" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Monthly/Quarterly Fee</label>
                    <Input type="number" value={formMonthlyQuarterly} onChange={e => setFormMonthlyQuarterly(e.target.value)} placeholder="0.00" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Quantity</label>
                    <Input type="number" min="1" value={formQuantity} onChange={e => setFormQuantity(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Unit Price</label>
                    <Input type="number" value={formUnitPrice} onChange={e => setFormUnitPrice(e.target.value)} placeholder="0.00" className="mt-1" />
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
                <Button onClick={handleAdd} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Add Fee</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No fee entries added.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>To Whom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Daily/Weekly</TableHead>
                  <TableHead className="text-right">Monthly/Quarter</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total (ETB)</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{OMNICHANNEL_PROVIDERS.find(p => p.value === item.toWhom)?.label}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.dailyWeeklyFee.toLocaleString()} {item.currency}</TableCell>
                    <TableCell className="text-right">{item.monthlyQuarterlyFee.toLocaleString()} {item.currency}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.unitPrice.toLocaleString()} {item.currency}</TableCell>
                    <TableCell className="text-right font-medium">{item.totalAmountBirr.toLocaleString()} ETB</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
