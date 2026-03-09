import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp } from "lucide-react";
import { IBD_MONTHS, IBDMonthlyEntry, IBDMonth } from "@/types/departmental";

const emptyEntries = (): IBDMonthlyEntry[] =>
  IBD_MONTHS.map(month => ({ month, fxInflow: 0, netFxRev: 0, surchargeGains: 0 }));

export default function IBDBudgetPage() {
  const [entries, setEntries] = useState<IBDMonthlyEntry[]>(emptyEntries());

  const updateEntry = (month: IBDMonth, field: keyof Omit<IBDMonthlyEntry, "month">, value: number) => {
    setEntries(prev => prev.map(e => e.month === month ? { ...e, [field]: value } : e));
  };

  const totalFxInflow = entries.reduce((s, e) => s + e.fxInflow, 0);
  const totalNetFxRev = entries.reduce((s, e) => s + e.netFxRev, 0);
  const totalSurcharge = entries.reduce((s, e) => s + e.surchargeGains, 0);

  const getPercentage = (value: number, total: number) => {
    if (total === 0 || value === 0) return "—";
    return ((value / total) * 100).toFixed(1) + "%";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">IBD — FX Revenue Budget</h1>
          <p className="text-sm text-muted-foreground mt-1">FY 2026/27 • Monthly FX Inflow, Net FX Revenue & Surcharge Gains (July–June)</p>
        </div>
        <Card className="border-accent/30 bg-accent/5 min-w-[260px]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total FX Inflow</p>
              <p className="text-xl font-bold text-foreground">{totalFxInflow.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Totals Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total FX Inflow</p>
            <p className="text-lg font-bold">{totalFxInflow.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Net FX Revenue</p>
            <p className="text-lg font-bold">{totalNetFxRev.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total S/Charge Gains</p>
            <p className="text-lg font-bold">{totalSurcharge.toLocaleString()}</p>
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
                  <TableHead className="text-right">FX Inflow</TableHead>
                  <TableHead className="text-right w-16">%</TableHead>
                  <TableHead className="text-right">Net FX Rev</TableHead>
                  <TableHead className="text-right w-16">%</TableHead>
                  <TableHead className="text-right">S/Charge Gains</TableHead>
                  <TableHead className="text-right w-16">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map(entry => (
                  <TableRow key={entry.month}>
                    <TableCell className="font-medium">{entry.month}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={entry.fxInflow || ""}
                        onChange={e => updateEntry(entry.month, "fxInflow", parseFloat(e.target.value) || 0)}
                        className="w-32 text-right ml-auto"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {getPercentage(entry.fxInflow, totalFxInflow)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={entry.netFxRev || ""}
                        onChange={e => updateEntry(entry.month, "netFxRev", parseFloat(e.target.value) || 0)}
                        className="w-32 text-right ml-auto"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {getPercentage(entry.netFxRev, totalNetFxRev)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={entry.surchargeGains || ""}
                        onChange={e => updateEntry(entry.month, "surchargeGains", parseFloat(e.target.value) || 0)}
                        className="w-32 text-right ml-auto"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {getPercentage(entry.surchargeGains, totalSurcharge)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{totalFxInflow.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-xs">100%</TableCell>
                  <TableCell className="text-right">{totalNetFxRev.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-xs">100%</TableCell>
                  <TableCell className="text-right">{totalSurcharge.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-xs">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
