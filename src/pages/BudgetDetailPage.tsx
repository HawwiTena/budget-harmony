import { useParams, Link } from "react-router-dom";
import { MOCK_BUDGET_REQUESTS } from "@/data/mockData";
import { APPROVAL_STAGES_BRANCH, APPROVAL_STAGES_DEPARTMENT } from "@/types/budget";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import ApprovalTimeline from "@/components/ApprovalTimeline";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Paperclip } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export default function BudgetDetailPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [comment, setComment] = useState("");
  const budget = MOCK_BUDGET_REQUESTS.find(b => b.id === id);

  if (!budget) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Budget not found.</p>
        <Link to="/budgets" className="text-accent hover:underline text-sm mt-2 inline-block">Back to budgets</Link>
      </div>
    );
  }

  const stages = budget.submittedByRole === "department_director"
    ? APPROVAL_STAGES_DEPARTMENT
    : APPROVAL_STAGES_BRANCH;

  const canApproveThisBudget = (() => {
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
    return roleStageMap[currentUser.role] === budget.status;
  })();

  const capexItems = budget.lineItems.filter(i => i.category === "CAPEX");
  const hrItems = budget.lineItems.filter(i => i.category === "HR");
  const directItems = budget.lineItems.filter(i => i.category === "Direct Expense");

  const handleAction = (action: "approve" | "revision") => {
    toast.success(action === "approve" ? "Budget approved successfully" : "Revision requested");
  };

  return (
    <div className="space-y-8 animate-slide-in">
      <Link to="/budgets" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="w-3 h-3" /> Back to budgets
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{budget.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {budget.branch || budget.department} · FY {budget.fiscalYear} · Submitted {budget.createdAt}
          </p>
        </div>
        <StatusBadge status={budget.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Amount</p>
                <p className="text-xl font-display font-bold text-foreground mt-1">
                  ETB {budget.totalAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Line Items</p>
                <p className="text-xl font-display font-bold text-foreground mt-1">{budget.lineItems.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Categories</p>
                <p className="text-xl font-display font-bold text-foreground mt-1">
                  {new Set(budget.lineItems.map(i => i.category)).size}
                </p>
              </div>
            </div>
          </div>

          {/* Line Items by Category */}
          {[
            { label: "CAPEX", items: capexItems, color: "accent" },
            { label: "HR", items: hrItems, color: "info" },
            { label: "Direct Expense", items: directItems, color: "warning" },
          ].map(section => section.items.length > 0 && (
            <div key={section.label} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground">{section.label}</h3>
              </div>
              {section.label === "CAPEX" ? (
                <>
                  {Array.from(new Set(section.items.map(i => i.capexSubCategory || "Other"))).map(sub => (
                    <div key={sub}>
                      <div className="px-5 py-2 bg-muted/10 border-b border-border">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{sub}</span>
                      </div>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2">Item</th>
                            <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2">Type</th>
                            <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2">Qty</th>
                            <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2">Unit Cost</th>
                            <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {section.items.filter(i => (i.capexSubCategory || "Other") === sub).map(item => (
                            <tr key={item.id}>
                              <td className="px-5 py-3">
                                <p className="text-sm font-medium text-foreground">{item.libraryItemName}</p>
                                <p className="text-xs text-muted-foreground">{item.justification}</p>
                                {item.attachmentName && (
                                  <span className="inline-flex items-center gap-1 text-xs text-accent mt-1">
                                    <Paperclip className="w-3 h-3" /> {item.attachmentName}
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                  item.type === "replacement" ? "bg-accent/10 text-accent" : "bg-success/10 text-success"
                                }`}>
                                  {item.type}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-sm text-foreground text-right">{item.quantity}</td>
                              <td className="px-5 py-3 text-sm text-foreground text-right">ETB {item.unitCost.toLocaleString()}</td>
                              <td className="px-5 py-3 text-sm font-medium text-foreground text-right">ETB {item.totalCost.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </>
              ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2">Item</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2">Type</th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2">Qty</th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2">Unit Cost</th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {section.items.map(item => (
                    <tr key={item.id}>
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-foreground">{item.libraryItemName}</p>
                        <p className="text-xs text-muted-foreground">{item.justification}</p>
                        {item.attachmentName && (
                          <span className="inline-flex items-center gap-1 text-xs text-accent mt-1">
                            <Paperclip className="w-3 h-3" /> {item.attachmentName}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          item.type === "replacement" ? "bg-accent/10 text-accent" : "bg-success/10 text-success"
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-foreground text-right">{item.quantity}</td>
                      <td className="px-5 py-3 text-sm text-foreground text-right">ETB {item.unitCost.toLocaleString()}</td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground text-right">ETB {item.totalCost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>

          {/* Approval Actions */}
          {canApproveThisBudget && (
            <div className="bg-card border border-accent/30 rounded-lg p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Your Action Required</h3>
              <Textarea
                placeholder="Add a comment (optional for approval, required for revision request)..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => handleAction("approve")}
                  className="bg-success text-success-foreground hover:bg-success/90"
                >
                  Approve Budget
                </Button>
                <Button
                  onClick={() => handleAction("revision")}
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent/10"
                  disabled={!comment.trim()}
                >
                  Request Revision
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Approval Timeline */}
        <div>
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Approval Progress</h3>
            <ApprovalTimeline approvalChain={budget.approvalChain} stages={stages} />
          </div>
        </div>
      </div>
    </div>
  );
}
