import { LibraryItem, BudgetRequest, User, UserRole, CapexLibraryItem, HRLibraryItem, DirectExpenseLibraryItem } from "@/types/budget";

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Abebe Kebede", role: "branch_manager", branch: "Bole Branch", district: "Addis Ababa District" },
  { id: "u2", name: "Sara Mengistu", role: "district_manager", district: "Addis Ababa District" },
  { id: "u3", name: "Dawit Haile", role: "branch_management_director" },
  { id: "u4", name: "Meron Tadesse", role: "retail_chief" },
  { id: "u5", name: "Yonas Assefa", role: "strategic_officer" },
  { id: "u6", name: "Helen Girma", role: "strategy_director" },
  { id: "u7", name: "Tesfaye Bekele", role: "department_director", department: "IT Department" },
  { id: "u8", name: "Lemlem Wolde", role: "department_chief", department: "IT" },
  { id: "u9", name: "Committee Members", role: "budget_hearing_committee" },
  { id: "u10", name: "Executive Team", role: "executive_committee" },
  { id: "u11", name: "Board Members", role: "board" },
];

const capexItems: CapexLibraryItem[] = [
  { id: "lib1", category: "CAPEX", itemName: "Desktop Computer", itemCategory: "Computer & Related", unitOfMeasurement: "Unit", unitPrice: 45000, status: "ACTIVE", createdBy: "u5", approvedBy: "u6", createdAt: "2025-11-01", updatedAt: "2025-11-01" },
  { id: "lib2", category: "CAPEX", itemName: "Office Furniture Set", itemCategory: "Furniture & Fittings", unitOfMeasurement: "Set", unitPrice: 30000, status: "ACTIVE", createdBy: "u5", approvedBy: "u6", createdAt: "2025-11-01", updatedAt: "2025-11-01" },
  { id: "lib3", category: "CAPEX", itemName: "Server Equipment", itemCategory: "Computer & Related", unitOfMeasurement: "Unit", unitPrice: 250000, status: "ACTIVE", createdBy: "u5", approvedBy: "u6", createdAt: "2025-10-15", updatedAt: "2025-10-15" },
  { id: "lib4", category: "CAPEX", itemName: "Vehicle", itemCategory: "Motor Vehicles & Related", unitOfMeasurement: "Unit", unitPrice: 1500000, status: "ACTIVE", createdBy: "u5", approvedBy: "u6", createdAt: "2025-10-15", updatedAt: "2025-10-15" },
  { id: "lib11", category: "CAPEX", itemName: "Security System", itemCategory: "Equipment", unitOfMeasurement: "Unit", unitPrice: 120000, status: "PENDING_CREATE", createdBy: "u5", createdAt: "2025-12-01", updatedAt: "2025-12-01" },
];

const hrItems: HRLibraryItem[] = [
  { id: "lib5", category: "HR", jobTitle: "Loan Officer", jobGrade: "Grade_V", jobCategory: "OPERATIONAL", baseSalary: 15000, cashIndemnity: 2000, hardshipAllowance: 0, laundryAllowance: 500, transportationAllowance: 1500, vehicleAllowance: 0, positionAllowance: 0, mobileAllowance: 800, status: "ACTIVE", createdBy: "u5", approvedBy: "u6", createdAt: "2025-11-01", updatedAt: "2025-11-01" },
  { id: "lib6", category: "HR", jobTitle: "Customer Service Rep", jobGrade: "Grade_III", jobCategory: "CLERICAL", baseSalary: 12000, cashIndemnity: 1500, hardshipAllowance: 0, laundryAllowance: 400, transportationAllowance: 1200, vehicleAllowance: 0, positionAllowance: 0, mobileAllowance: 500, status: "ACTIVE", createdBy: "u5", approvedBy: "u6", createdAt: "2025-11-01", updatedAt: "2025-11-01" },
  { id: "lib7", category: "HR", jobTitle: "Branch Manager Assistant", jobGrade: "Grade_VI", jobCategory: "MANAGERIAL", baseSalary: 18000, cashIndemnity: 2500, hardshipAllowance: 0, laundryAllowance: 600, transportationAllowance: 2000, vehicleAllowance: 0, positionAllowance: 1000, mobileAllowance: 1000, status: "ACTIVE", createdBy: "u5", approvedBy: "u6", createdAt: "2025-11-01", updatedAt: "2025-11-01" },
];

const directExpenseItems: DirectExpenseLibraryItem[] = [
  { id: "lib8", category: "Direct Expense", expenseCategory: "Rent", description: "Office Rent", status: "ACTIVE", createdBy: "u5", approvedBy: "u6", createdAt: "2025-09-01", updatedAt: "2025-09-01" },
  { id: "lib9", category: "Direct Expense", expenseCategory: "Utilities", description: "Electricity, water, internet", status: "ACTIVE", createdBy: "u5", approvedBy: "u6", createdAt: "2025-09-01", updatedAt: "2025-09-01" },
  { id: "lib10", category: "Direct Expense", expenseCategory: "Supplies", description: "Office Supplies", status: "ACTIVE", createdBy: "u5", approvedBy: "u6", createdAt: "2025-09-01", updatedAt: "2025-09-01" },
];

export const MOCK_LIBRARY_ITEMS: LibraryItem[] = [
  ...capexItems,
  ...hrItems,
  ...directExpenseItems,
];

export const MOCK_BUDGET_REQUESTS: BudgetRequest[] = [
  {
    id: "br1",
    fiscalYear: "2026/27",
    title: "Bole Branch FY 2026/27 Budget",
    submittedBy: "u1",
    submittedByRole: "branch_manager",
    branch: "Bole Branch",
    district: "Addis Ababa District",
    status: "district_review",
    currentStep: 2,
    lineItems: [
      { id: "li1", libraryItemId: "lib1", libraryItemName: "Desktop Computer", category: "CAPEX", capexSubCategory: "Computer & Related", remark: "REPLACEMENT", quantity: 5, unitCost: 45000, totalCost: 225000, amount: 225000, purposeAndNecessity: "Existing units are 5+ years old", desiredQuarterForProcurement: "QUARTER_1", documentId: "doc1", documentName: "asset_condition_report.pdf" },
      { id: "li2", libraryItemId: "lib5", libraryItemName: "Loan Officer", category: "HR", remark: "NEW", quantity: 2, unitCost: 15000, totalCost: 30000, amount: 30000, purposeAndNecessity: "Increasing loan portfolio requires additional staff", desiredQuarterForProcurement: "QUARTER_2" },
      { id: "li3", libraryItemId: "lib8", libraryItemName: "Office Rent", category: "Direct Expense", remark: "NEW", quantity: 12, unitCost: 50000, totalCost: 600000, amount: 600000, purposeAndNecessity: "Annual office rent", desiredQuarterForProcurement: "QUARTER_1" },
    ],
    totalAmount: 855000,
    approvalChain: [
      { stage: "submitted", label: "Submitted", approvedBy: "Abebe Kebede", approvedAt: "2026-01-15", action: "approved" },
      { stage: "district_review", label: "District Manager" },
    ],
    createdAt: "2026-01-15",
    updatedAt: "2026-01-15",
  },
  {
    id: "br2",
    fiscalYear: "2026/27",
    title: "Merkato Branch FY 2026/27 Budget",
    submittedBy: "u1",
    submittedByRole: "branch_manager",
    branch: "Merkato Branch",
    district: "Addis Ababa District",
    status: "strategy_review",
    currentStep: 5,
    lineItems: [
      { id: "li4", libraryItemId: "lib2", libraryItemName: "Office Furniture Set", category: "CAPEX", capexSubCategory: "Furniture & Fittings", remark: "NEW", quantity: 10, unitCost: 30000, totalCost: 300000, amount: 300000, purposeAndNecessity: "New branch expansion", desiredQuarterForProcurement: "QUARTER_1" },
      { id: "li5", libraryItemId: "lib6", libraryItemName: "Customer Service Rep", category: "HR", remark: "NEW", quantity: 3, unitCost: 12000, totalCost: 36000, amount: 36000, purposeAndNecessity: "High customer traffic requires more staff", desiredQuarterForProcurement: "QUARTER_2" },
      { id: "li6", libraryItemId: "lib9", libraryItemName: "Utilities", category: "Direct Expense", remark: "NEW", quantity: 12, unitCost: 8000, totalCost: 96000, amount: 96000, purposeAndNecessity: "Annual utilities", desiredQuarterForProcurement: "QUARTER_1" },
    ],
    totalAmount: 432000,
    approvalChain: [
      { stage: "submitted", label: "Submitted", approvedBy: "Abebe Kebede", approvedAt: "2026-01-10", action: "approved" },
      { stage: "district_review", label: "District Manager", approvedBy: "Sara Mengistu", approvedAt: "2026-01-12", action: "approved", comment: "Aligned with district expansion plan" },
      { stage: "director_review", label: "Branch Mgmt Director", approvedBy: "Dawit Haile", approvedAt: "2026-01-14", action: "approved" },
      { stage: "chief_review", label: "Retail Chief", approvedBy: "Meron Tadesse", approvedAt: "2026-01-16", action: "approved" },
      { stage: "strategy_review", label: "Strategy & Change Mgmt" },
    ],
    createdAt: "2026-01-10",
    updatedAt: "2026-01-16",
  },
  {
    id: "br3",
    fiscalYear: "2026/27",
    title: "IT Department FY 2026/27 Budget",
    submittedBy: "u7",
    submittedByRole: "department_director",
    department: "IT Department",
    status: "chief_review",
    currentStep: 2,
    lineItems: [
      { id: "li7", libraryItemId: "lib3", libraryItemName: "Server Equipment", category: "CAPEX", capexSubCategory: "Computer & Related", remark: "REPLACEMENT", quantity: 3, unitCost: 250000, totalCost: 750000, amount: 750000, purposeAndNecessity: "End-of-life servers need replacement", desiredQuarterForProcurement: "QUARTER_1", documentId: "doc2", documentName: "server_eol_report.pdf" },
    ],
    totalAmount: 750000,
    approvalChain: [
      { stage: "submitted", label: "Submitted", approvedBy: "Tesfaye Bekele", approvedAt: "2026-01-08", action: "approved" },
      { stage: "chief_review", label: "Department Chief" },
    ],
    createdAt: "2026-01-08",
    updatedAt: "2026-01-08",
  },
  {
    id: "br4",
    fiscalYear: "2026/27",
    title: "Hawassa Branch FY 2026/27 Budget",
    submittedBy: "u1",
    submittedByRole: "branch_manager",
    branch: "Hawassa Branch",
    district: "Southern District",
    status: "revision_requested",
    currentStep: 2,
    lineItems: [
      { id: "li8", libraryItemId: "lib4", libraryItemName: "Vehicle", category: "CAPEX", capexSubCategory: "Motor Vehicles & Related", remark: "NEW", quantity: 1, unitCost: 1500000, totalCost: 1500000, amount: 1500000, purposeAndNecessity: "Required for field operations", desiredQuarterForProcurement: "QUARTER_3" },
    ],
    totalAmount: 1500000,
    approvalChain: [
      { stage: "submitted", label: "Submitted", approvedBy: "Abebe Kebede", approvedAt: "2026-01-05", action: "approved" },
      { stage: "district_review", label: "District Manager", approvedBy: "Sara Mengistu", approvedAt: "2026-01-07", action: "revision_requested", comment: "Please provide cost comparison with leasing option" },
    ],
    createdAt: "2026-01-05",
    updatedAt: "2026-01-07",
  },
];

export function getCurrentUser(role: UserRole): User {
  return MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
}
