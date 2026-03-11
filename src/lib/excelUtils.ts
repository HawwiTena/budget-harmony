import * as XLSX from "xlsx";
import { toast } from "sonner";

// ===== GENERIC EXPORT =====
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName = "Sheet1"
) {
  if (data.length === 0) {
    toast.error("No data to export");
    return;
  }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
  toast.success(`Exported ${data.length} rows to ${filename}.xlsx`);
}

// ===== GENERIC IMPORT =====
export function importFromExcel<T>(
  file: File,
  onData: (data: T[]) => void,
  sheetIndex = 0
) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[sheetIndex];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<T>(worksheet);
      onData(jsonData);
      toast.success(`Imported ${jsonData.length} rows from ${file.name}`);
    } catch {
      toast.error("Failed to parse Excel file. Please check the format.");
    }
  };
  reader.readAsArrayBuffer(file);
}

// ===== Marketing Export/Import =====
export function exportMarketingData(items: Array<{
  group: string; description: string; remark: string;
  quantity: number; unitPrice: number; currency: string; totalAmountBirr: number;
}>) {
  exportToExcel(items.map(i => ({
    "Group": i.group, "Description": i.description, "Remark": i.remark,
    "Quantity": i.quantity, "Unit Price": i.unitPrice, "Currency": i.currency,
    "Total (ETB)": i.totalAmountBirr,
  })), "Marketing_Budget", "Marketing");
}

// ===== Property/Vehicle Export =====
export function exportVehicleData(items: Array<{
  carModel: string; description: string; requestingDepartment: string;
  quantity: number; unitPrice: number; currency: string; totalAmountBirr: number;
}>) {
  exportToExcel(items.map(i => ({
    "Car Model": i.carModel, "Description": i.description,
    "Department": i.requestingDepartment, "Quantity": i.quantity,
    "Unit Price": i.unitPrice, "Currency": i.currency, "Total (ETB)": i.totalAmountBirr,
  })), "Vehicle_Budget", "Vehicles");
}

// ===== Procurement Export =====
export function exportProcurementData(items: Array<{
  category: string; capexItemName: string; department: string;
  quantity: number; contractOrderAmount: number; paymentIssued: number;
  totalRemainingUSD: number; totalRemainingBirr: number; currency: string;
}>) {
  exportToExcel(items.map(i => ({
    "Category": i.category, "Item": i.capexItemName, "Department": i.department,
    "Quantity": i.quantity, "Contract Amount": i.contractOrderAmount,
    "Payment Issued": i.paymentIssued, "Remaining (USD)": i.totalRemainingUSD,
    "Remaining (ETB)": i.totalRemainingBirr, "Currency": i.currency,
  })), "Procurement_Budget", "Procurement");
}

// ===== IT Budget Export =====
export function exportITData(items: Array<{
  category: string; description: string; submittedByDepartment: string;
  quantity: number; unitPrice: number; currency: string;
  birrFee: number; vat15: number; totalWithVat: number; remark?: string; status: string;
}>) {
  exportToExcel(items.map(i => ({
    "Category": i.category, "Description": i.description, "Department": i.submittedByDepartment,
    "Quantity": i.quantity, "Unit Price": i.unitPrice, "Currency": i.currency,
    "Birr Fee": i.birrFee, "VAT 15%": i.vat15, "Total (incl VAT)": i.totalWithVat,
    "Remark": i.remark || "", "Status": i.status,
  })), "IT_Budget", "IT Budget");
}

// ===== Omnichannel Export =====
export function exportOmnichannelData(items: Array<{
  toWhom: string; description: string; dailyWeeklyFee: number;
  monthlyQuarterlyFee: number; quantity: number; unitPrice: number;
  currency: string; totalAmountBirr: number;
}>) {
  exportToExcel(items.map(i => ({
    "Provider": i.toWhom, "Description": i.description,
    "Daily/Weekly Fee": i.dailyWeeklyFee, "Monthly/Quarterly Fee": i.monthlyQuarterlyFee,
    "Quantity": i.quantity, "Unit Price": i.unitPrice, "Currency": i.currency,
    "Total (ETB)": i.totalAmountBirr,
  })), "Omnichannel_Budget", "Omnichannel");
}

// ===== IBD Export =====
export function exportIBDData(entries: Array<{
  month: string; projectedInflow: number; serviceCharge: number;
  netFxRevenue: number; assumptions?: string;
}>) {
  exportToExcel(entries.map(e => ({
    "Month": e.month, "Projected Inflow": e.projectedInflow,
    "Service Charge": e.serviceCharge, "Net FX Revenue": e.netFxRevenue,
    "Assumptions": e.assumptions || "",
  })), "IBD_FX_Revenue", "IBD");
}

// ===== HR Transfer Export =====
export function exportHRTransferData(items: Array<{
  positionName: string; department: string; quantity: number;
  unitCost: number; totalCost: number; remark?: string;
}>) {
  exportToExcel(items.map(i => ({
    "Position": i.positionName, "Department": i.department,
    "Quantity": i.quantity, "Unit Cost (ETB)": i.unitCost,
    "Total Cost (ETB)": i.totalCost, "Remark": i.remark || "",
  })), "HR_Transfer_Budget", "HR Transfer");
}
