import { MOCK_BUDGET_REQUESTS } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function BudgetListPage() {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const canSubmit = ["branch_manager", "department_director"].includes(currentUser.role);

  const filtered = MOCK_BUDGET_REQUESTS.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Budget Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and track fiscal year budget requests</p>
        </div>
        {canSubmit && (
          <Link to="/budgets/new">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
              <Plus className="w-4 h-4" /> New Budget
            </Button>
          </Link>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search budgets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Title</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Branch/Dept</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">FY</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Amount</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(budget => (
              <tr key={budget.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/budgets/${budget.id}`} className="text-sm font-medium text-foreground hover:text-accent">
                    {budget.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {budget.branch || budget.department}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{budget.fiscalYear}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  ETB {budget.totalAmount.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={budget.status} />
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{budget.createdAt}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">
                  No budget requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
