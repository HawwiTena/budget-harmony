import { LibraryItem, BudgetRequest, User, UserRole } from "@/types/budget";

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

export const MOCK_LIBRARY_ITEMS: LibraryItem[] = [
  { id: "lib1", name: "Desktop Computer", category: "CAPEX", description: "Standard desktop workstation", defaultAmount: 45000, status: "active", createdBy: "u5", approvedBy: "u6", createdAt: "2025-11-01", updatedAt: "2025-11-01" },
  { id: "lib2", name: "Office Furniture Set", category: "CAPEX", description: "Desk, chair, and cabinet", defaultAmount: 30000, status: "active", createdBy: "u5", approvedBy: "u6", createdAt: "2025-11-01", updatedAt: "2025-11-01" },
  { id: "lib3", name: "Server Equipment", category: "CAPEX", description: "Rack-mounted server unit", defaultAmount: 250000, status: "active", createdBy: "u5", approvedBy: "u6", createdAt: "2025-10-15", updatedAt: "2025-10-15" },
  { id: "lib4", name: "Vehicle", category: "CAPEX", description: "Company vehicle for branch operations", defaultAmount: 1500000, status: "active", createdBy: "u5", approvedBy: "u6", createdAt: "2025-10-15", updatedAt: "2025-10-15" },
  { id: "lib5", name: "Loan Officer", category: "HR", description: "Loan officer position", defaultAmount: 15000, status: "active", createdBy: "u5", approvedBy: "u6", createdAt: "2025-11-01", updatedAt: "2025-11-01" },
  { id: "lib6", name: "Customer Service Rep", category: "HR", description: "Front-desk customer service", defaultAmount: 12000, status: "active", createdBy: "u5", approvedBy: "u6", createdAt: "2025-11-01", updatedAt: "2025-11-01" },
  { id: "lib7", name: "Branch Manager Assistant", category: "HR", description: "Assistant to branch manager", defaultAmount: 18000, status: "active", createdBy: "u5", approvedBy: "u6", createdAt: "2025-11-01", updatedAt: "2025-11-01" },
  { id: "lib8", name: "Office Rent", category: "Direct Expense", description: "Monthly office space rental", defaultAmount: 50000, status: "active", createdBy: "u5", approvedBy: "u6", createdAt: "2025-09-01", updatedAt: "2025-09-01" },
  { id: "lib9", name: "Utilities", category: "Direct Expense", description: "Electricity, water, internet", defaultAmount: 8000, status: "active", createdBy: "u5", approvedBy: "u6", createdAt: "2025-09-01", updatedAt: "2025-09-01" },
  { id: "lib10", name: "Office Supplies", category: "Direct Expense", description: "Stationery and consumables", defaultAmount: 5000, status: "active", createdBy: "u5", approvedBy: "u6", createdAt: "2025-09-01", updatedAt: "2025-09-01" },
  { id: "lib11", name: "Security System", category: "CAPEX", description: "CCTV and access control", defaultAmount: 120000, status: "pending_approval", createdBy: "u5", createdAt: "2025-12-01", updatedAt: "2025-12-01" },
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
    lineItems: [
      { id: "li1", libraryItemId: "lib1", libraryItemName: "Desktop Computer", category: "CAPEX", type: "replacement", quantity: 5, unitCost: 45000, totalCost: 225000, justification: "Existing units are 5+ years old", attachmentName: "asset_condition_report.pdf" },
      { id: "li2", libraryItemId: "lib5", libraryItemName: "Loan Officer", category: "HR", type: "new", quantity: 2, unitCost: 15000, totalCost: 30000, justification: "Increasing loan portfolio requires additional staff" },
      { id: "li3", libraryItemId: "lib8", libraryItemName: "Office Rent", category: "Direct Expense", type: "new", quantity: 12, unitCost: 50000, totalCost: 600000, justification: "Annual office rent" },
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
    lineItems: [
      { id: "li4", libraryItemId: "lib2", libraryItemName: "Office Furniture Set", category: "CAPEX", type: "new", quantity: 10, unitCost: 30000, totalCost: 300000, justification: "New branch expansion" },
      { id: "li5", libraryItemId: "lib6", libraryItemName: "Customer Service Rep", category: "HR", type: "new", quantity: 3, unitCost: 12000, totalCost: 36000, justification: "High customer traffic requires more staff" },
      { id: "li6", libraryItemId: "lib9", libraryItemName: "Utilities", category: "Direct Expense", type: "new", quantity: 12, unitCost: 8000, totalCost: 96000, justification: "Annual utilities" },
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
    lineItems: [
      { id: "li7", libraryItemId: "lib3", libraryItemName: "Server Equipment", category: "CAPEX", type: "replacement", quantity: 3, unitCost: 250000, totalCost: 750000, justification: "End-of-life servers need replacement", attachmentName: "server_eol_report.pdf" },
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
    lineItems: [
      { id: "li8", libraryItemId: "lib4", libraryItemName: "Vehicle", category: "CAPEX", type: "new", quantity: 1, unitCost: 1500000, totalCost: 1500000, justification: "Required for field operations" },
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
