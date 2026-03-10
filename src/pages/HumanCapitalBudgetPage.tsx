import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HRTransferItem, DEPARTMENTS_LIST, DepartmentName } from "@/types/departmental";
import { MOCK_LIBRARY_ITEMS } from "@/data/mockData";
import { getLibraryItemName, getLibraryItemAmount, HRLibraryItem } from "@/types/budget";

export default function HumanCapitalBudgetPage() {
  const [items, setItems] = useState<HRTransferItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const hrLibrary = MOCK_LIBRARY_ITEMS.filter(i => i.category === "HR" && i.status === "ACTIVE") as HRLibraryItem[];

  const [formLibItem, setFormLibItem] = useState("");
  const [formDept, setFormDept] = useState<DepartmentName>("IT");
  const [formQty, setFormQty] = useState("1");
  const [formRemark, setFormRemark] = useState("");

  const totalBudget = items.reduce((s, i) => s + i.totalCost, 0);

  const handleAdd = () => {
    if (!formLibItem) return;
    const lib = hrLibrary.find(l => l.id === formLibItem);
    if (!lib) return;
    const qty = parseInt(formQty) || 1;
    const unitCost = getLibraryItemAmount(lib);
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      positionName: lib.jobTitle,
      libraryItemId: lib.id,
      department: formDept,
      quantity: qty,
      unitCost,
      totalCost: unitCost * qty,
      remark: formRemark || undefined,
    }]);
    setFormLibItem(""); setFormQty("1"); setFormRemark("");
    setDialogOpen(false);
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Human Capital — Transfer HR Budget</h1>
          <p className="text-sm text-muted-foreground mt-1">FY 2026/27 • Transferred recruitment positions from previous fiscal year</p>
        </div>
        <Card className="border-accent/30 bg-accent/5 min-w-[220px]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total HR Transfer Budget</p>
              <p className="text-xl font-bold text-foreground">{totalBudget.toLocaleString()} <span className="text-xs text-muted-foreground">ETB</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Transfer Positions ({items.length})</CardTitle>
            <p className="text-xs text-muted-foreground">
              Positions from departments that had hires started in the previous fiscal year
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="w-4 h-4 mr-1" /> Add Position
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Transfer Position</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Position (from HR Library)</label>
                  <Select value={formLibItem} onValueChange={setFormLibItem}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select position" /></SelectTrigger>
                    <SelectContent>
                      {hrLibrary.map(lib => (
                        <SelectItem key={lib.id} value={lib.id}>
                          {lib.jobTitle} — {lib.jobGrade} — {getLibraryItemAmount(lib).toLocaleString()} ETB
                        </SelectItem>
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
                <div>
                  <label className="text-sm font-medium text-foreground">Quantity</label>
                  <Input type="number" min="1" value={formQty} onChange={e => setFormQty(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Remark (optional)</label>
                  <Input value={formRemark} onChange={e => setFormRemark(e.target.value)} className="mt-1" placeholder="e.g. Started hiring in Q3 FY25" />
                </div>
                <Button onClick={handleAdd} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Add Position</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No transfer positions added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Cost (ETB)</TableHead>
                  <TableHead className="text-right">Total (ETB)</TableHead>
                  <TableHead>Remark</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.positionName}</TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.unitCost.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">{item.totalCost.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.remark || "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={4}>Grand Total</TableCell>
                  <TableCell className="text-right">{totalBudget.toLocaleString()} ETB</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
