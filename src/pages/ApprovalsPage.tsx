import { useMemo, useState } from "react";
import { MOCK_BUDGET_REQUESTS, DISTRICT_BRANCHES } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, AlertTriangle, ChevronDown, ChevronRight, MapPin, Building2 } from "lucide-react";

interface DistrictConsolidated {
  district: string;
  branches: string[];
  budgets: typeof MOCK_BUDGET_REQUESTS;
  totalAmount: number;
  branchCount: number;
}

export default function ApprovalsPage() {
  const { currentUser } = useAuth();
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(new Set());

  const roleStageMap: Record<string, string> = {
    district_manager: "district_review",
    branch_management_director: "director_review",
    retail_chief: "chief_review",
    strategy_director: "strategy_review",
    department_chief: "chief_review",
    budget_hearing_committee: "budget_hearing",
    executive_committee: "executive_review",
    board: "board_review",
  };

  const myStage = roleStageMap[currentUser.role];

  // For branch_management_director and retail_chief: show district-consolidated approval queue
  const showDistrictConsolidated = currentUser.role === "branch_management_director" || currentUser.role === "retail_chief";

  // Only branch budgets (not department budgets) for director/chief
  const branchBudgetsPending = useMemo(() => {
    if (!showDistrictConsolidated) return [];
    return MOCK_BUDGET_REQUESTS.filter(b => b.status === myStage && b.branch && b.district);
  }, [showDistrictConsolidated, myStage]);

  // Group branch budgets by district
  const districtConsolidated = useMemo<DistrictConsolidated[]>(() => {
    if (!showDistrictConsolidated) return [];

    const districtMap = new Map<string, typeof MOCK_BUDGET_REQUESTS>();
    branchBudgetsPending.forEach(b => {
      const dist = b.district || "Unknown";
      if (!districtMap.has(dist)) districtMap.set(dist, []);
      districtMap.get(dist)!.push(b);
    });

    return Array.from(districtMap.entries()).map(([district, budgets]) => ({
      district,
      branches: DISTRICT_BRANCHES[district] || budgets.map(b => b.branch || "Unknown"),
      budgets,
      totalAmount: budgets.reduce((s, b) => s + b.totalAmount, 0),
      branchCount: budgets.length,
    }));
  }, [showDistrictConsolidated, branchBudgetsPending]);

  // Department budgets pending (for chief who is also department_chief)
  const deptBudgetsPending = useMemo(() => {
    if (!showDistrictConsolidated) {
      return MOCK_BUDGET_REQUESTS.filter(b => b.status === myStage);
    }
    // Director/chief also see department budgets at their stage
    return MOCK_BUDGET_REQUESTS.filter(b => b.status === myStage && b.department && !b.branch);
  }, [showDistrictConsolidated, myStage]);

  // Standard pending (for non-director/chief roles)
  const standardPending = useMemo(() => {
    if (showDistrictConsolidated) return [];
    return MOCK_BUDGET_REQUESTS.filter(b => b.status === myStage);
  }, [showDistrictConsolidated, myStage]);

  const othersInPipeline = MOCK_BUDGET_REQUESTS.filter(
    b => b.status !== myStage && !["approved", "rejected"].includes(b.status)
  );

  const toggleDistrict = (district: string) => {
    setExpandedDistricts(prev => {
      const next = new Set(prev);
      if (next.has(district)) next.delete(district);
      else next.add(district);
      return next;
    });
  };

  const totalPending = showDistrictConsolidated
    ? districtConsolidated.reduce((s, d) => s + d.budgets.length, 0) + deptBudgetsPending.length
    : standardPending.length;

  return (
    <div className="space-y-8 animate-slide-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Approvals</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {showDistrictConsolidated
            ? "District-consolidated budget requests awaiting your review"
            : "Budget requests awaiting your review"}
        </p>
      </div>

      {/* Pending for me */}
      <div>
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Awaiting Your Action ({totalPending})
        </h2>

        {totalPending === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No budgets pending your approval</p>
          </div>
        ) : showDistrictConsolidated ? (
          <div className="space-y-4">
            {/* District-consolidated branch budgets */}
            {districtConsolidated.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Branch Budgets by District
                </h3>
                <div className="space-y-3">
                  {districtConsolidated.map(dc => {
                    const isExpanded = expandedDistricts.has(dc.district);
                    return (
                      <Card key={dc.district} className="border-accent/20">
                        <Collapsible open={isExpanded} onOpenChange={() => toggleDistrict(dc.district)}>
                          <CollapsibleTrigger className="w-full">
                            <CardHeader className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                  <div className="text-left">
                                    <CardTitle className="text-sm">{dc.district}</CardTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {dc.branchCount} branch{dc.branchCount !== 1 ? "es" : ""} · ETB {dc.totalAmount.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">{dc.branchCount} pending</Badge>
                                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                                    Review All
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0 pb-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Branch</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead className="text-right">Amount (ETB)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {dc.budgets.map(budget => (
                                    <TableRow key={budget.id}>
                                      <TableCell className="text-xs font-medium">{budget.branch}</TableCell>
                                      <TableCell>
                                        <Link to={`/budgets/${budget.id}`} className="text-sm font-medium text-foreground hover:text-accent">
                                          {budget.title}
                                        </Link>
                                      </TableCell>
                                      <TableCell className="text-right text-sm">{budget.totalAmount.toLocaleString()}</TableCell>
                                      <TableCell><StatusBadge status={budget.status} /></TableCell>
                                      <TableCell className="text-right">
                                        <Link to={`/budgets/${budget.id}`}>
                                          <Button size="sm" variant="outline" className="text-xs">Review</Button>
                                        </Link>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              {/* District summary footer */}
                              <div className="mt-3 pt-3 border-t border-border flex justify-between items-center px-2">
                                <span className="text-xs text-muted-foreground">District Total</span>
                                <span className="text-sm font-semibold text-foreground">ETB {dc.totalAmount.toLocaleString()}</span>
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Department budgets also pending at this stage */}
            {deptBudgetsPending.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Department Budgets
                </h3>
                <div className="space-y-3">
                  {deptBudgetsPending.map(budget => (
                    <Link
                      key={budget.id}
                      to={`/budgets/${budget.id}`}
                      className="block bg-card border border-accent/20 rounded-lg p-5 hover:border-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{budget.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {budget.department} · FY {budget.fiscalYear} · ETB {budget.totalAmount.toLocaleString()}
                          </p>
                        </div>
                        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                          Review
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Standard individual budget list for other roles */
          <div className="space-y-3">
            {standardPending.map(budget => (
              <Link
                key={budget.id}
                to={`/budgets/${budget.id}`}
                className="block bg-card border border-accent/20 rounded-lg p-5 hover:border-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{budget.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {budget.branch || budget.department} · FY {budget.fiscalYear} · ETB {budget.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Review
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pipeline */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Other Budgets in Pipeline</h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Title</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Source</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {othersInPipeline.map(budget => (
                <tr key={budget.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/budgets/${budget.id}`} className="text-sm font-medium text-foreground hover:text-accent">
                      {budget.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{budget.branch || budget.department}</td>
                  <td className="px-4 py-3 text-sm text-foreground">ETB {budget.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={budget.status} /></td>
                </tr>
              ))}
              {othersInPipeline.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No other budgets in pipeline.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
