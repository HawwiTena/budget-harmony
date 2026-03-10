import { Currency } from "./budget";

// ==================== DEPARTMENTAL BUDGET TYPES ====================

export const USD_TO_BIRR_RATE = 130;
export const EURO_TO_BIRR_RATE = 140;

export function convertToBirr(amount: number, currency: Currency): number {
  switch (currency) {
    case "USD": return amount * USD_TO_BIRR_RATE;
    case "EURO": return amount * EURO_TO_BIRR_RATE;
    case "ETB": return amount;
  }
}

// ---- UnitType (WorkUnit) ----
export type UnitType = "FUNCTION" | "DIVISION" | "DEPARTMENT" | "BRANCH" | "EXECUTIVE_OFFICE" | "BOARD_OFFICE";

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
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: Currency;
  totalAmountBirr: number;
  remark: "NEW" | "TRANSFER";
  metadata?: Record<string, unknown>;
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
  description: string;
  carModel: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: Currency;
  totalAmountBirr: number;
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
  unitPrice: number;
  contractOrderAmount: number;
  paymentIssued: number;
  totalRemainingUSD: number;
  totalRemainingBirr: number;
  currency: Currency;
}

// ---- IT Budget ----
export type ITBudgetCategory = "SOFTWARE" | "SERVICEFEE" | "RLF";

export const IT_BUDGET_CATEGORIES: { value: ITBudgetCategory; label: string }[] = [
  { value: "SOFTWARE", label: "Software" },
  { value: "SERVICEFEE", label: "Service Fees" },
  { value: "RLF", label: "RLF" },
];

export interface ITBudgetLineItem {
  id: string;
  category: ITBudgetCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: Currency;
  birrFee: number;
  vat15: number;
  totalWithVat: number;
  remark?: string;
  submittedByDepartment: string;
  status: "PENDING" | "APPROVED" | "REVISION_REQUIRED";
}

// ---- Omnichannel ----
export type OmnichannelToWhom = "ETHSWICTH" | "VISA" | "MASTERCARD";

export const OMNICHANNEL_PROVIDERS: { value: OmnichannelToWhom; label: string }[] = [
  { value: "MASTERCARD", label: "MasterCard" },
  { value: "VISA", label: "Visa International" },
  { value: "ETHSWICTH", label: "EthSwitch" },
];

export interface OmnichannelFeeItem {
  id: string;
  toWhom: OmnichannelToWhom;
  description: string;
  dailyWeeklyFee: number;
  monthlyQuarterlyFee: number;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: Currency;
  totalAmountBirr: number;
}

// ---- IBD ----
export const IBD_MONTHS = [
  "July", "August", "September", "October", "November", "December",
  "January", "February", "March", "April", "May", "June",
] as const;

export type IBDMonth = (typeof IBD_MONTHS)[number];

export interface IBDMonthlyEntry {
  month: IBDMonth;
  monthNumber: number; // 1-12 matching schema
  year: number;
  projectedInflow: number;
  serviceCharge: number;
  netFxRevenue: number;
  assumptions?: string;
}

// ---- Human Capital ----
export interface HRTransferItem {
  id: string;
  positionName: string;
  libraryItemId: string;
  department: DepartmentName;
  quantity: number;
  unitCost: number;
  totalCost: number;
  remark?: string;
}

// ---- Rent (from schema) ----
export type RentRemark = "RENEWED" | "NOTRENEWED";

// ---- Departmental Budget Category (from schema BudgetCategory enum) ----
export type DepartmentalBudgetCategory =
  | "MARKETING"
  | "PROCUREMENT"
  | "OMNICHANNEL"
  | "RENT"
  | "IBD"
  | "IT"
  | "VEHICLE"
  | "HR_TRANSFER";
