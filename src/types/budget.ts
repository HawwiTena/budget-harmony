export type UserRole =
  | "library_admin"
  | "strategic_officer"
  | "strategy_director"
  | "branch_manager"
  | "district_manager"
  | "branch_management_director"
  | "retail_chief"
  | "department_director"
  | "department_chief"
  | "budget_hearing_committee"
  | "executive_committee"
  | "board";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department?: string;
  branch?: string;
  district?: string;
}

export type BudgetCategory = "CAPEX" | "HR" | "Direct Expense";

export type BudgetItemType = "new" | "replacement";

export type BudgetStatus =
  | "draft"
  | "submitted"
  | "district_review"
  | "director_review"
  | "chief_review"
  | "strategy_review"
  | "budget_hearing"
  | "executive_review"
  | "board_review"
  | "approved"
  | "revision_requested"
  | "rejected";

export type LibraryItemStatus = "active" | "inactive" | "pending_approval" | "rejected";

export interface LibraryItem {
  id: string;
  name: string;
  category: BudgetCategory;
  description: string;
  defaultAmount: number;
  status: LibraryItemStatus;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetLineItem {
  id: string;
  libraryItemId: string;
  libraryItemName: string;
  category: BudgetCategory;
  type: BudgetItemType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  justification: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface ApprovalStep {
  stage: BudgetStatus;
  label: string;
  approvedBy?: string;
  approvedAt?: string;
  comment?: string;
  action?: "approved" | "revision_requested" | "rejected";
}

export interface BudgetRequest {
  id: string;
  fiscalYear: string;
  title: string;
  submittedBy: string;
  submittedByRole: UserRole;
  branch?: string;
  department?: string;
  district?: string;
  status: BudgetStatus;
  lineItems: BudgetLineItem[];
  totalAmount: number;
  approvalChain: ApprovalStep[];
  createdAt: string;
  updatedAt: string;
}

export const APPROVAL_STAGES_BRANCH: { stage: BudgetStatus; label: string }[] = [
  { stage: "submitted", label: "Submitted" },
  { stage: "district_review", label: "District Manager" },
  { stage: "director_review", label: "Branch Mgmt Director" },
  { stage: "chief_review", label: "Retail Chief" },
  { stage: "strategy_review", label: "Strategy & Change Mgmt" },
  { stage: "budget_hearing", label: "Budget Hearing Committee" },
  { stage: "executive_review", label: "Executive Committee" },
  { stage: "board_review", label: "Board" },
  { stage: "approved", label: "Final Approval" },
];

export const APPROVAL_STAGES_DEPARTMENT: { stage: BudgetStatus; label: string }[] = [
  { stage: "submitted", label: "Submitted" },
  { stage: "chief_review", label: "Department Chief" },
  { stage: "strategy_review", label: "Strategy & Change Mgmt" },
  { stage: "budget_hearing", label: "Budget Hearing Committee" },
  { stage: "executive_review", label: "Executive Committee" },
  { stage: "board_review", label: "Board" },
  { stage: "approved", label: "Final Approval" },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  library_admin: "Library Administrator",
  strategic_officer: "Strategic Officer",
  strategy_director: "Strategy & Change Mgmt Director",
  branch_manager: "Branch Manager",
  district_manager: "District Manager",
  branch_management_director: "Branch Management Director",
  retail_chief: "Retail Chief",
  department_director: "Department Director",
  department_chief: "Department Chief",
  budget_hearing_committee: "Budget Hearing Committee",
  executive_committee: "Executive Committee",
  board: "Board",
};
