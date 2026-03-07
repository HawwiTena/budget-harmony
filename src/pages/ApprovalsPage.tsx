import { MOCK_BUDGET_REQUESTS } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function ApprovalsPage() {
  const { currentUser } = useAuth();

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
  const pendingForMe = MOCK_BUDGET_REQUESTS.filter(b => b.status === myStage);
  const othersInPipeline = MOCK_BUDGET_REQUESTS.filter(b => b.status !== myStage && !["approved", "rejected"].includes(b.status));

  return (
    <div className="space-y-8 animate-slide-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Approvals</h1>
        <p className="text-muted-foreground text-sm mt-1">Budget requests awaiting your review</p>
      </div>

      {/* Pending for me */}
      <div>
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Awaiting Your Action ({pendingForMe.length})
        </h2>
        {pendingForMe.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No budgets pending your approval</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingForMe.map(budget => (
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
                  <td className="px-4 py-3 text-sm text-foreground">ETB {budget.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={budget.status} /></td>
                </tr>
              ))}
              {othersInPipeline.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">No other budgets in pipeline.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
