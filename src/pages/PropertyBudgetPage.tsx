import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Car } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VehicleLineItem, DEPARTMENTS_LIST, DepartmentName, USD_TO_BIRR_RATE } from "@/types/departmental";

export default function PropertyBudgetPage() {
  const [items, setItems] = useState<VehicleLineItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formModel, setFormModel] = useState("");
  const [formQty, setFormQty] = useState("1");
  const [formCurrency, setFormCurrency] = useState("ETB");
  const [formPrice, setFormPrice] = useState("");
  const [formDept, setFormDept] = useState<DepartmentName>("IT");

  const totalBudget = items.reduce((sum, i) => sum + i.priceBirr * i.quantity, 0);

  const handleAdd = () => {
    if (!formModel || !formPrice) return;
    const price = parseFloat(formPrice);
    const priceBirr = formCurrency === "USD" ? price * USD_TO_BIRR_RATE : price;
    const newItem: VehicleLineItem = {
      id: crypto.randomUUID(),
      carModel: formModel,
      quantity: parseInt(formQty) || 1,
      currency: formCurrency,
      price,
      priceBirr,
      requestingDepartment: formDept,
    };
    setItems(prev => [...prev, newItem]);
    setFormModel(""); setFormPrice(""); setFormQty("1");
    setDialogOpen(false);
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Property & Logistics — Vehicle Budget</h1>
          <p className="text-sm text-muted-foreground mt-1">FY 2026/27 • Vehicle procurement for all departments</p>
        </div>
        <Card className="border-accent/30 bg-accent/5 min-w-[220px]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Vehicle Budget</p>
              <p className="text-xl font-bold text-foreground">
                {totalBudget.toLocaleString()} <span className="text-xs text-muted-foreground">ETB</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Vehicle Items ({items.length})</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="w-4 h-4 mr-1" /> Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Vehicle Item</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Car Model</label>
                  <Input value={formModel} onChange={e => setFormModel(e.target.value)} placeholder="e.g. Toyota Hilux" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Requesting Department</label>
                  <Select value={formDept} onValueChange={v => setFormDept(v as DepartmentName)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS_LIST.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Quantity</label>
                    <Input type="number" min="1" value={formQty} onChange={e => setFormQty(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Currency</label>
                    <Select value={formCurrency} onValueChange={setFormCurrency}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ETB">ETB</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Unit Price</label>
                    <Input type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="0.00" className="mt-1" />
                  </div>
                </div>
                {formCurrency === "USD" && formPrice && (
                  <p className="text-xs text-muted-foreground">≈ {(parseFloat(formPrice) * USD_TO_BIRR_RATE).toLocaleString()} ETB per unit</p>
                )}
                <Button onClick={handleAdd} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Add Vehicle</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No vehicles added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car Model</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total (ETB)</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.carModel}</TableCell>
                    <TableCell>{item.requestingDepartment}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.price.toLocaleString()} {item.currency}</TableCell>
                    <TableCell className="text-right font-medium">{(item.priceBirr * item.quantity).toLocaleString()} ETB</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={4}>Grand Total</TableCell>
                  <TableCell className="text-right">{totalBudget.toLocaleString()} ETB</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
