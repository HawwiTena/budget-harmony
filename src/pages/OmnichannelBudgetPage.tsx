import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OmnichannelFeeItem, OmnichannelProvider, OmnichannelFeeType, USD_TO_BIRR_RATE } from "@/types/departmental";

const PROVIDERS: OmnichannelProvider[] = ["MasterCard", "Visa International", "EthSwitch"];
const FEE_TYPES: OmnichannelFeeType[] = ["Daily/Weekly", "Monthly/Quarter"];

export default function OmnichannelBudgetPage() {
  const [items, setItems] = useState<OmnichannelFeeItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formProvider, setFormProvider] = useState<OmnichannelProvider>("MasterCard");
  const [formFeeType, setFormFeeType] = useState<OmnichannelFeeType>("Daily/Weekly");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");

  const totalBirr = items.reduce((s, i) => s + i.amountBirr, 0);

  const handleAdd = () => {
    if (!formAmount) return;
    const amount = parseFloat(formAmount);
    const amountBirr = formCurrency === "USD" ? amount * USD_TO_BIRR_RATE : amount;
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      provider: formProvider,
      feeType: formFeeType,
      amount,
      currency: formCurrency,
      amountBirr,
    }]);
    setFormAmount("");
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
        {PROVIDERS.map(provider => {
          const pItems = items.filter(i => i.provider === provider);
          const pTotal = pItems.reduce((s, i) => s + i.amountBirr, 0);
          return (
            <Card key={provider}>
              <CardContent className="p-4">
                <h3 className="font-medium text-foreground">{provider}</h3>
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
                  <label className="text-sm font-medium text-foreground">Provider</label>
                  <Select value={formProvider} onValueChange={v => setFormProvider(v as OmnichannelProvider)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Fee Type</label>
                  <Select value={formFeeType} onValueChange={v => setFormFeeType(v as OmnichannelFeeType)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FEE_TYPES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
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
                  <TableHead>Provider</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Amount (ETB)</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.provider}</TableCell>
                    <TableCell>{item.feeType}</TableCell>
                    <TableCell className="text-right">{item.amount.toLocaleString()} {item.currency}</TableCell>
                    <TableCell className="text-right font-medium">{item.amountBirr.toLocaleString()} ETB</TableCell>
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
