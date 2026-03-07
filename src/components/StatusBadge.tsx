import { BudgetStatus } from "@/types/budget";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border border-border" },
  submitted: { label: "Submitted", className: "bg-info/10 text-info border border-info/20" },
  district_review: { label: "District Review", className: "status-badge-pending" },
  director_review: { label: "Director Review", className: "status-badge-pending" },
  chief_review: { label: "Chief Review", className: "status-badge-pending" },
  strategy_review: { label: "Strategy Review", className: "status-badge-pending" },
  budget_hearing: { label: "Budget Hearing", className: "status-badge-pending" },
  executive_review: { label: "Executive Review", className: "status-badge-pending" },
  board_review: { label: "Board Review", className: "status-badge-pending" },
  approved: { label: "Approved", className: "status-badge-approved" },
  revision_requested: { label: "Revision Requested", className: "status-badge-revision" },
  rejected: { label: "Rejected", className: "status-badge-rejected" },
};

export default function StatusBadge({ status }: { status: BudgetStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
