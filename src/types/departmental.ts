// ==================== DEPARTMENTAL BUDGET TYPES ====================

export const USD_TO_BIRR_RATE = 130; // Exchange rate

// ---- Marketing ----
export const MARKETING_BUDGET_GROUPS = [
  "Ad Productions",
  "Ad Model/Cast for Ads",
  "Print Advertisement Placements",
  "Ethiopian Airlines - INK Ad Partnership",
  "Outdoor Advertisement Placements",
  "TV AD Placement",
  "Radio AD Placement",
  "Voice over Exclusive Celebrity for Zemen Ad & Publications",
  "Zemen Jingle/Anthem",
  "Media Monitoring Agency",
  "Sponsorship & Events",
  "General Marketing Materials",
  "Digital/Social Media Marketing and Website Revamping",
  "Giveaway Materials",
  "Special Holiday Gifts for Corporate and Retail Customers",
  "Campaigns",
  "Outsourced Surveys",
  "Press Conference & Media Relations Management",
  "Customer Feedback Real Time Collection",
] as const;

export type MarketingBudgetGroup = (typeof MARKETING_BUDGET_GROUPS)[number];

export interface MarketingLineItem {
  id: string;
  group: MarketingBudgetGroup;
  name: string;
  type: "new" | "transferred";
  amount: number;
  currency: string;
  amountBirr: number;
  remark?: string;
}

// ---- Property / Vehicles ----
export const DEPARTMENTS_LIST = [
  "Marketing",
  "Finance",
  "Omnichannel",
  "IBD",
  "IT",
  "Procurement",
  "Property/Logistics",
  "Human Capital",
  "Strategy & Change Mgmt",
  "Retail",
  "Risk & Compliance",
  "Legal",
  "Internal Audit",
] as const;

export type DepartmentName = (typeof DEPARTMENTS_LIST)[number];

export interface VehicleLineItem {
  id: string;
  carModel: string;
  quantity: number;
  currency: string;
  price: number;
  priceBirr: number;
  requestingDepartment: DepartmentName;
}

// ---- Procurement CAPEX ----
export type ProcurementCategory = "IT" | "Non-IT";

export interface ProcurementLineItem {
  id: string;
  category: ProcurementCategory;
  capexItemName: string;
  department: DepartmentName;
  quantity: number;
  contractOrderAmount: number;
  paymentIssued: number;
  totalRemainingUSD: number;
  totalRemainingBirr: number;
  currency: "USD" | "ETB";
}

// ---- IT Budget ----
export type ITBudgetCategory = "Software" | "RLF" | "Service Fees";

export interface ITBudgetLineItem {
  id: string;
  category: ITBudgetCategory;
  name: string;
  amount: number;
  currency: string;
  amountBirr: number;
  vat15: number;
  totalWithVat: number;
  remark?: string;
  submittedByDepartment: string;
  status: "pending" | "approved" | "revision_requested";
}

// ---- Omnichannel ----
export type OmnichannelProvider = "MasterCard" | "Visa International" | "EthSwitch";
export type OmnichannelFeeType = "Daily/Weekly" | "Monthly/Quarter";

export interface OmnichannelFeeItem {
  id: string;
  provider: OmnichannelProvider;
  feeType: OmnichannelFeeType;
  amount: number;
  currency: string;
  amountBirr: number;
}

// ---- IBD ----
export const IBD_MONTHS = [
  "July", "August", "September", "October", "November", "December",
  "January", "February", "March", "April", "May", "June",
] as const;

export type IBDMonth = (typeof IBD_MONTHS)[number];

export interface IBDMonthlyEntry {
  month: IBDMonth;
  fxInflow: number;
  netFxRev: number;
  surchargeGains: number;
}

// ---- Human Capital ----
export interface HRTransferItem {
  id: string;
  positionName: string; // from library
  libraryItemId: string;
  department: DepartmentName;
  quantity: number;
  unitCost: number;
  totalCost: number;
  remark?: string;
}
