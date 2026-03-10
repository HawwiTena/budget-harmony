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

export type CapexSubCategory =
  | "Computer & Related"
  | "Furniture & Fittings"
  | "Motor Vehicles & Related"
  | "Equipment";

export const CAPEX_SUB_CATEGORIES: CapexSubCategory[] = [
  "Computer & Related",
  "Furniture & Fittings",
  "Motor Vehicles & Related",
  "Equipment",
];

// Matches REMARKS enum from schema
export type BudgetItemRemark = "NEW" | "TRANSFER" | "REPLACEMENT" | "OUTSOURCED";

export const BUDGET_ITEM_REMARKS: { value: BudgetItemRemark; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "REPLACEMENT", label: "Replacement" },
  { value: "OUTSOURCED", label: "Outsourced" },
];

// Matches QUARTERS enum from schema
export type Quarter = "QUARTER_1" | "QUARTER_2" | "QUARTER_3" | "QUARTER_4";

export const QUARTERS: { value: Quarter; label: string }[] = [
  { value: "QUARTER_1", label: "Quarter 1 (Jul–Sep)" },
  { value: "QUARTER_2", label: "Quarter 2 (Oct–Dec)" },
  { value: "QUARTER_3", label: "Quarter 3 (Jan–Mar)" },
  { value: "QUARTER_4", label: "Quarter 4 (Apr–Jun)" },
];

// Matches CURRENCY enum from schema
export type Currency = "ETB" | "USD" | "EURO";

export const CURRENCIES: { value: Currency; label: string }[] = [
  { value: "ETB", label: "ETB (Birr)" },
  { value: "USD", label: "USD" },
  { value: "EURO", label: "EURO" },
];

// Matches ApprovalAction enum from schema
export type ApprovalAction = "PENDING" | "REVISION_REQUIRED" | "REJECTED" | "APPROVED";

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

// Matches LibraryStatus enum from schema
export type LibraryItemStatus =
  | "PENDING_CREATE"
  | "PENDING_EDIT"
  | "PENDING_DEACTIVATE"
  | "ACTIVE"
  | "INACTIVE"
  | "REJECTED";

export const LIBRARY_STATUS_LABELS: Record<LibraryItemStatus, string> = {
  PENDING_CREATE: "Pending Create",
  PENDING_EDIT: "Pending Edit",
  PENDING_DEACTIVATE: "Pending Deactivate",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  REJECTED: "Rejected",
};

// Matches JobGrade enum from schema
export type JobGrade =
  | "Grade_I" | "Grade_II" | "Grade_III" | "Grade_IV" | "Grade_V"
  | "Grade_VI" | "Grade_VII" | "Grade_VIII" | "Grade_IX" | "Grade_X"
  | "Grade_XI" | "Grade_XII" | "Grade_XIII";

export const JOB_GRADES: JobGrade[] = [
  "Grade_I", "Grade_II", "Grade_III", "Grade_IV", "Grade_V",
  "Grade_VI", "Grade_VII", "Grade_VIII", "Grade_IX", "Grade_X",
  "Grade_XI", "Grade_XII", "Grade_XIII",
];

// Matches JobCatagory enum from schema
export type JobCategory = "MANAGERIAL" | "OPERATIONAL" | "TECHNICAL" | "CLERICAL" | "NONCLERICAL";

export const JOB_CATEGORIES: { value: JobCategory; label: string }[] = [
  { value: "MANAGERIAL", label: "Managerial" },
  { value: "OPERATIONAL", label: "Operational" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "CLERICAL", label: "Clerical" },
  { value: "NONCLERICAL", label: "Non-Clerical" },
];

// ---- Library Item types matching schema models ----

// Base library item
export interface LibraryItemBase {
  id: string;
  category: BudgetCategory;
  status: LibraryItemStatus;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Matches CapexLibrary model
export interface CapexLibraryItem extends LibraryItemBase {
  category: "CAPEX";
  itemName: string;
  itemCategory: CapexSubCategory;
  unitOfMeasurement: string;
  unitPrice: number;
}

// Matches HRPositions model
export interface HRLibraryItem extends LibraryItemBase {
  category: "HR";
  jobTitle: string;
  jobGrade: JobGrade;
  jobCategory: JobCategory;
  workUnitId?: number;
  baseSalary: number;
  cashIndemnity: number;
  hardshipAllowance: number;
  laundryAllowance: number;
  transportationAllowance: number;
  vehicleAllowance: number;
  positionAllowance: number;
  mobileAllowance: number;
}

// Matches DirectExpense model
export interface DirectExpenseLibraryItem extends LibraryItemBase {
  category: "Direct Expense";
  expenseCategory: string;
  description: string;
}

export type LibraryItem = CapexLibraryItem | HRLibraryItem | DirectExpenseLibraryItem;

// Helper to get display name
export function getLibraryItemName(item: LibraryItem): string {
  switch (item.category) {
    case "CAPEX": return item.itemName;
    case "HR": return item.jobTitle;
    case "Direct Expense": return item.description;
  }
}

// Helper to get default amount
export function getLibraryItemAmount(item: LibraryItem): number {
  switch (item.category) {
    case "CAPEX": return item.unitPrice;
    case "HR": return item.baseSalary + item.cashIndemnity + item.hardshipAllowance +
      item.laundryAllowance + item.transportationAllowance + item.vehicleAllowance +
      item.positionAllowance + item.mobileAllowance;
    case "Direct Expense": return 0;
  }
}

// Matches BudgetDetail model
export interface BudgetLineItem {
  id: string;
  libraryItemId: string;
  libraryItemName: string;
  category: BudgetCategory;
  capexSubCategory?: CapexSubCategory;
  amount: number;
  purposeAndNecessity: string;
  desiredQuarterForProcurement: Quarter;
  remark: BudgetItemRemark;
  documentId?: string;
  documentName?: string;
  // Calculated
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface ApprovalStep {
  stage: BudgetStatus;
  label: string;
  approvedBy?: string;
  approvedAt?: string;
  comment?: string;
  action?: "approved" | "revision_requested" | "rejected";
  onBehalfOf?: string;
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
  currentStep: number;
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
