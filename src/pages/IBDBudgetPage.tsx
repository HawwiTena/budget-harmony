import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp } from "lucide-react";
import { IBD_MONTHS, IBDMonthlyEntry, IBDMonth } from "@/types/departmental";

const MONTH_NUMBERS: Record<IBDMonth, number> = {
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
};

const emptyEntries = (): IBDMonthlyEntry[] =>
  IBD_MONTHS.map(month => ({
    month,
    monthNumber: MONTH_NUMBERS[month],
    year: MONTH_NUMBERS[month] >= 7 ? 2026 : 2027,
    projectedInflow: 0,
    serviceCharge: 0,
    netFxRevenue: 0,
    assumptions: "",
  }));

export default function IBDBudgetPage() {
  const [entries, setEntries] = useState<IBDMonthlyEntry[]>(emptyEntries());

  const updateEntry = (month: IBDMonth, field: "projectedInflow" | "serviceCharge" | "netFxRevenue" | "assumptions", value: number | string) => {
    setEntries(prev => prev.map(e => e.month === month ? { ...e, [field]: value } : e));
  };

  const totalInflow = entries.reduce((s, e) => s + e.projectedInflow, 0);
  const totalCharge = entries.reduce((s, e) => s + e.serviceCharge, 0);
  const totalRevenue = entries.reduce((s, e) => s + e.netFxRevenue, 0);

  const getPercentage = (value: number, total: number) => {
    if (total === 0 || value === 0) return "—";
    return ((value / total) * 100).toFixed(1) + "%";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">IBD — FX Revenue Budget</h1>
          <p className="text-sm text-muted-foreground mt-1">FY 2026/27 • Monthly Projected Inflow, Service Charge & Net FX Revenue (July–June)</p>
        </div>
        <Card className="border-accent/30 bg-accent/5 min-w-[260px]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Projected Inflow</p>
              <p className="text-xl font-bold text-foreground">{totalInflow.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Totals Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Projected Inflow</p>
            <p className="text-lg font-bold">{totalInflow.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Service Charge</p>
            <p className="text-lg font-bold">{totalCharge.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Net FX Revenue</p>
            <p className="text-lg font-bold">{totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly FX Data (July – June)</CardTitle>
          <p className="text-xs text-muted-foreground">
            Enter values for each month. The percentage beside each input shows that month's share of the running total.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Month</TableHead>
                  <TableHead className="text-right">Projected Inflow</TableHead>
                  <TableHead className="text-right w-16">%</TableHead>
                  <TableHead className="text-right">Service Charge</TableHead>
                  <TableHead className="text-right w-16">%</TableHead>
                  <TableHead className="text-right">Net FX Revenue</TableHead>
                  <TableHead className="text-right w-16">%</TableHead>
                  <TableHead className="w-40">Assumptions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map(entry => (
                  <TableRow key={entry.month}>
                    <TableCell className="font-medium">{entry.month}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={entry.projectedInflow || ""}
                        onChange={e => updateEntry(entry.month, "projectedInflow", parseFloat(e.target.value) || 0)}
                        className="w-32 text-right ml-auto"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {getPercentage(entry.projectedInflow, totalInflow)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={entry.serviceCharge || ""}
                        onChange={e => updateEntry(entry.month, "serviceCharge", parseFloat(e.target.value) || 0)}
                        className="w-32 text-right ml-auto"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {getPercentage(entry.serviceCharge, totalCharge)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={entry.netFxRevenue || ""}
                        onChange={e => updateEntry(entry.month, "netFxRevenue", parseFloat(e.target.value) || 0)}
                        className="w-32 text-right ml-auto"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {getPercentage(entry.netFxRevenue, totalRevenue)}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.assumptions || ""}
                        onChange={e => updateEntry(entry.month, "assumptions", e.target.value)}
                        className="w-36 text-xs"
                        placeholder="Notes..."
                      />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{totalInflow.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-xs">100%</TableCell>
                  <TableCell className="text-right">{totalCharge.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-xs">100%</TableCell>
                  <TableCell className="text-right">{totalRevenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-xs">100%</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
