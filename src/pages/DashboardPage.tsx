import { useAuth } from "@/contexts/AuthContext";
import { MOCK_BUDGET_REQUESTS } from "@/data/mockData";
import { BudgetRequest, ROLE_LABELS } from "@/types/budget";
import StatusBadge from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import {
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { currentUser, roleLabel } = useAuth();
  const role = currentUser.role;

  const canSubmit = ["branch_manager", "department_director"].includes(role);
  const canApprove = ["district_manager", "branch_management_director", "retail_chief", "strategy_director", "department_chief", "budget_hearing_committee", "executive_committee", "board"].includes(role);
  const canManageLibrary = ["strategic_officer", "strategy_director"].includes(role);

  // Simple stats
  const totalBudgets = MOCK_BUDGET_REQUESTS.length;
  const pendingBudgets = MOCK_BUDGET_REQUESTS.filter(b => !["approved", "rejected"].includes(b.status)).length;
  const approvedBudgets = MOCK_BUDGET_REQUESTS.filter(b => b.status === "approved").length;
  const revisionBudgets = MOCK_BUDGET_REQUESTS.filter(b => b.status === "revision_requested").length;
  const totalAmount = MOCK_BUDGET_REQUESTS.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {currentUser.name} · <span className="text-accent font-medium">{roleLabel}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Budgets" value={totalBudgets} />
        <StatCard icon={Clock} label="Pending Review" value={pendingBudgets} variant="warning" />
        <StatCard icon={CheckCircle2} label="Approved" value={approvedBudgets} variant="success" />
        <StatCard icon={TrendingUp} label="Total Amount" value={`ETB ${(totalAmount / 1000000).toFixed(1)}M`} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {canSubmit && (
          <ActionCard
            title="Submit Budget Request"
            description="Create a new budget request for the upcoming fiscal year"
            href="/budgets/new"
            icon={FileText}
          />
        )}
        {canApprove && (
          <ActionCard
            title="Review Pending Approvals"
            description="Review and approve budget requests awaiting your action"
            href="/approvals"
            icon={CheckCircle2}
          />
        )}
        {canManageLibrary && (
          <ActionCard
            title="Manage Budget Library"
            description="Add, edit, or deactivate budget item templates"
            href="/library"
            icon={TrendingUp}
          />
        )}
        <ActionCard
          title="View All Budgets"
          description="Browse all budget requests and their current status"
          href="/budgets"
          icon={Clock}
        />
      </div>

      {/* Recent Budgets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-foreground">Recent Budget Requests</h2>
          <Link to="/budgets" className="text-sm text-accent hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Title</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">FY</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_BUDGET_REQUESTS.slice(0, 5).map(budget => (
                <tr key={budget.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/budgets/${budget.id}`} className="text-sm font-medium text-foreground hover:text-accent">
                      {budget.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{budget.fiscalYear}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    ETB {budget.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={budget.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, variant }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  variant?: "warning" | "success";
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          variant === "warning" ? "bg-warning/10 text-warning" :
          variant === "success" ? "bg-success/10 text-success" :
          "bg-muted text-muted-foreground"
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-display font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ title, description, href, icon: Icon }: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <Link
      to={href}
      className="group bg-card border border-border rounded-lg p-5 hover:border-accent/50 hover:shadow-sm transition-all flex items-start gap-4"
    >
      <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </Link>
  );
}
