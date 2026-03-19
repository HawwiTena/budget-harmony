import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Search, BarChart3, Package, Users, Receipt, Megaphone, Car, CreditCard, TrendingUp, Monitor, Info } from "lucide-react";
import { MOCK_BUDGET_REQUESTS, IT_CHILD_DEPARTMENTS } from "@/data/mockData";
import { BudgetLineItem, CAPEX_SUB_CATEGORIES } from "@/types/budget";
import { useAuth } from "@/contexts/AuthContext";
import * as XLSX from "xlsx";

// Mock departmental data for consolidated view
const MOCK_DEPT_MARKETING = [
  { id: "dm1", group: "Ad Productions", description: "TV Commercial Production", quantity: 2, unitPrice: 150000, totalAmountBirr: 300000, department: "Marketing", remark: "NEW" },
  { id: "dm2", group: "Sponsorship & Events", description: "Annual Banking Conference", quantity: 1, unitPrice: 500000, totalAmountBirr: 500000, department: "Marketing", remark: "NEW" },
  { id: "dm3", group: "Digital/Social Media Marketing and Website Revamping", description: "Social Media Campaign Q1-Q2", quantity: 1, unitPrice: 200000, totalAmountBirr: 200000, department: "Marketing", remark: "TRANSFER" },
];

const MOCK_DEPT_VEHICLES = [
  { id: "dv1", carModel: "Toyota Hilux", department: "IT", quantity: 2, unitPrice: 1800000, totalAmountBirr: 3600000, currency: "ETB" },
  { id: "dv2", carModel: "Toyota Land Cruiser", department: "Retail", quantity: 1, unitPrice: 4500000, totalAmountBirr: 4500000, currency: "ETB" },
];

const MOCK_DEPT_IT = [
  { id: "dit1", category: "SOFTWARE", description: "Oracle DB License", department: "Database Administration", birrFee: 3250000, vat15: 573529, totalWithVat: 3823529, status: "APPROVED" },
  { id: "dit2", category: "SERVICEFEE", description: "AWS Cloud Services", department: "Infrastructure & Operations", birrFee: 2340000, vat15: 412941, totalWithVat: 2752941, status: "PENDING" },
  { id: "dit3", category: "SOFTWARE", description: "IDE Licenses", department: "Application Development", birrFee: 450000, vat15: 79412, totalWithVat: 529412, status: "PENDING" },
];

const MOCK_DEPT_OMNICHANNEL = [
  { id: "do1", toWhom: "MASTERCARD", description: "Annual License Fee", totalAmountBirr: 1200000, currency: "USD" },
  { id: "do2", toWhom: "VISA", description: "Transaction Processing Fee", totalAmountBirr: 980000, currency: "USD" },
];

const MOCK_DEPT_IBD = [
  { id: "dibd1", month: "July", projectedInflow: 5000000, serviceCharge: 125000, netFxRevenue: 4875000 },
  { id: "dibd2", month: "August", projectedInflow: 4500000, serviceCharge: 112500, netFxRevenue: 4387500 },
];

const MOCK_DEPT_HR_TRANSFER = [
  { id: "dhr1", positionName: "Loan Officer", department: "Retail", quantity: 5, unitCost: 19800, totalCost: 99000 },
  { id: "dhr2", positionName: "Customer Service Rep", department: "Omnichannel", quantity: 3, unitCost: 15600, totalCost: 46800 },
];

type ConsolidatedTab = "all_capex" | "all_hr" | "all_direct" | "marketing" | "vehicles" | "it" | "omnichannel" | "ibd" | "hr_transfer";

export default function ConsolidatedBudgetPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ConsolidatedTab>("all_capex");
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");

  // Role-based filtering logic
  const isDeptChief = currentUser.role === "department_chief";
  const isITChief = isDeptChief && currentUser.department?.toLowerCase().includes("information technology") || currentUser.department?.toLowerCase().includes("technology");
  const isBranchDirector = currentUser.role === "branch_management_director";
  const isRetailChief = currentUser.role === "retail_chief";
  const showAllTabs = !isDeptChief; // IT chiefs only see IT-related tabs

  // Filter budget requests based on role
  const filteredBudgetRequests = useMemo(() => {
    if (isITChief) {
      // IT chief only sees budgets from IT child departments
      return MOCK_BUDGET_REQUESTS.filter(br =>
        br.department && IT_CHILD_DEPARTMENTS.some(d =>
          br.department?.toLowerCase().includes(d.toLowerCase())
        )
      );
    }
    // Director and retail chief see all (branch + department)
    return MOCK_BUDGET_REQUESTS;
  }, [isITChief]);

  // Aggregate from filtered requests
  const allCapex = useMemo(() => {
    return filteredBudgetRequests.flatMap(br =>
      br.lineItems
        .filter(li => li.category === "CAPEX")
        .map(li => ({ ...li, source: br.branch || br.department || "Unknown", budgetTitle: br.title, status: br.status }))
    );
  }, [filteredBudgetRequests]);

  const allHR = useMemo(() => {
    return filteredBudgetRequests.flatMap(br =>
      br.lineItems
        .filter(li => li.category === "HR")
        .map(li => ({ ...li, source: br.branch || br.department || "Unknown", budgetTitle: br.title, status: br.status }))
    );
  }, [filteredBudgetRequests]);

  const allDirect = useMemo(() => {
    return filteredBudgetRequests.flatMap(br =>
      br.lineItems
        .filter(li => li.category === "Direct Expense")
        .map(li => ({ ...li, source: br.branch || br.department || "Unknown", budgetTitle: br.title, status: br.status }))
    );
  }, [filteredBudgetRequests]);

  const totalCapex = allCapex.reduce((s, i) => s + i.totalCost, 0);
  const totalHR = allHR.reduce((s, i) => s + i.totalCost, 0);
  const totalDirect = allDirect.reduce((s, i) => s + i.totalCost, 0);
  const grandTotal = totalCapex + totalHR + totalDirect;

  const departments = useMemo(() => {
    const sources = new Set([
      ...allCapex.map(i => i.source),
      ...allHR.map(i => i.source),
      ...allDirect.map(i => i.source),
    ]);
    return Array.from(sources).sort();
  }, [allCapex, allHR, allDirect]);

  // Filtered IT data for IT chief
  const filteredITData = useMemo(() => {
    if (isITChief) {
      return MOCK_DEPT_IT; // All IT sub-departments are visible to IT chief
    }
    return MOCK_DEPT_IT;
  }, [isITChief]);

  const filterBySearch = <T extends { source?: string; department?: string }>(items: T[]) => {
    let filtered = items;
    if (filterDept !== "all") {
      filtered = filtered.filter(i => (i.source || i.department) === filterDept);
    }
    return filtered;
  };

  // Available tabs based on role
  const availableTabs = useMemo(() => {
    if (isITChief) {
      // IT chief only sees CAPEX/HR/Direct from IT depts + IT tab
      return ["all_capex", "all_hr", "all_direct", "it"] as ConsolidatedTab[];
    }
    return ["all_capex", "all_hr", "all_direct", "marketing", "vehicles", "it", "omnichannel", "ibd", "hr_transfer"] as ConsolidatedTab[];
  }, [isITChief]);

  const roleContextLabel = useMemo(() => {
    if (isITChief) return "IT Child Departments Only";
    if (isBranchDirector) return "All Branches & Departments";
    if (isRetailChief) return "All Branches & Departments";
    return "All Branches & Departments";
  }, [isITChief, isBranchDirector, isRetailChief]);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: All CAPEX
    const capexData = allCapex.map(i => ({
      "Source": i.source,
      "Item": i.libraryItemName,
      "Sub-Category": i.capexSubCategory || "",
      "Remark": i.remark,
      "Quarter": i.desiredQuarterForProcurement,
      "Quantity": i.quantity,
      "Unit Cost (ETB)": i.unitCost,
      "Total Cost (ETB)": i.totalCost,
      "Status": i.status,
    }));
    const ws1 = XLSX.utils.json_to_sheet(capexData);
    XLSX.utils.book_append_sheet(wb, ws1, "All CAPEX");

    // Sheet 2: All HR
    const hrData = allHR.map(i => ({
      "Source": i.source,
      "Position": i.libraryItemName,
      "Remark": i.remark,
      "Quantity": i.quantity,
      "Unit Cost (ETB)": i.unitCost,
      "Total Cost (ETB)": i.totalCost,
      "Status": i.status,
    }));
    const ws2 = XLSX.utils.json_to_sheet(hrData);
    XLSX.utils.book_append_sheet(wb, ws2, "All HR");

    // Sheet 3: All Direct Expense
    const directData = allDirect.map(i => ({
      "Source": i.source,
      "Item": i.libraryItemName,
      "Remark": i.remark,
      "Quantity": i.quantity,
      "Unit Cost (ETB)": i.unitCost,
      "Total Cost (ETB)": i.totalCost,
      "Status": i.status,
    }));
    const ws3 = XLSX.utils.json_to_sheet(directData);
    XLSX.utils.book_append_sheet(wb, ws3, "All Direct Expense");

    // Sheet 4: Marketing
    const mktData = MOCK_DEPT_MARKETING.map(i => ({
      "Group": i.group,
      "Description": i.description,
      "Remark": i.remark,
      "Quantity": i.quantity,
      "Unit Price": i.unitPrice,
      "Total (ETB)": i.totalAmountBirr,
    }));
    const ws4 = XLSX.utils.json_to_sheet(mktData);
    XLSX.utils.book_append_sheet(wb, ws4, "Marketing");

    // Sheet 5: Vehicles
    const vehData = MOCK_DEPT_VEHICLES.map(i => ({
      "Car Model": i.carModel,
      "Department": i.department,
      "Quantity": i.quantity,
      "Unit Price": i.unitPrice,
      "Total (ETB)": i.totalAmountBirr,
    }));
    const ws5 = XLSX.utils.json_to_sheet(vehData);
    XLSX.utils.book_append_sheet(wb, ws5, "Vehicles");

    // Sheet 6: IT Budget
    const itData = MOCK_DEPT_IT.map(i => ({
      "Category": i.category,
      "Description": i.description,
      "Department": i.department,
      "Birr Fee": i.birrFee,
      "VAT 15%": i.vat15,
      "Total (incl VAT)": i.totalWithVat,
      "Status": i.status,
    }));
    const ws6 = XLSX.utils.json_to_sheet(itData);
    XLSX.utils.book_append_sheet(wb, ws6, "IT Budget");

    // Sheet 7: Omnichannel
    const omniData = MOCK_DEPT_OMNICHANNEL.map(i => ({
      "Provider": i.toWhom,
      "Description": i.description,
      "Total (ETB)": i.totalAmountBirr,
    }));
    const ws7 = XLSX.utils.json_to_sheet(omniData);
    XLSX.utils.book_append_sheet(wb, ws7, "Omnichannel");

    // Sheet 8: IBD
    const ibdData = MOCK_DEPT_IBD.map(i => ({
      "Month": i.month,
      "Projected Inflow": i.projectedInflow,
      "Service Charge": i.serviceCharge,
      "Net FX Revenue": i.netFxRevenue,
    }));
    const ws8 = XLSX.utils.json_to_sheet(ibdData);
    XLSX.utils.book_append_sheet(wb, ws8, "IBD FX Revenue");

    // Sheet 9: HR Transfer
    const hrTransData = MOCK_DEPT_HR_TRANSFER.map(i => ({
      "Position": i.positionName,
      "Department": i.department,
      "Quantity": i.quantity,
      "Unit Cost (ETB)": i.unitCost,
      "Total Cost (ETB)": i.totalCost,
    }));
    const ws9 = XLSX.utils.json_to_sheet(hrTransData);
    XLSX.utils.book_append_sheet(wb, ws9, "HR Transfer");

    XLSX.writeFile(wb, `Consolidated_Budget_FY2026-27.xlsx`);
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Consolidated Budget View</h1>
          <p className="text-sm text-muted-foreground mt-1">FY 2026/27 • All branches & departments combined</p>
        </div>
        <Button onClick={handleExportExcel} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export All to Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Grand Total</p>
                <p className="text-lg font-bold text-foreground">{grandTotal.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">ETB</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Package className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total CAPEX</p>
                <p className="text-lg font-bold text-foreground">{totalCapex.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total HR</p>
                <p className="text-lg font-bold text-foreground">{totalHR.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Receipt className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Direct Expense</p>
                <p className="text-lg font-bold text-foreground">{totalDirect.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Sources" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as ConsolidatedTab)}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all_capex" className="gap-1"><Package className="w-3 h-3" /> All CAPEX</TabsTrigger>
          <TabsTrigger value="all_hr" className="gap-1"><Users className="w-3 h-3" /> All HR</TabsTrigger>
          <TabsTrigger value="all_direct" className="gap-1"><Receipt className="w-3 h-3" /> All Direct Exp</TabsTrigger>
          <TabsTrigger value="marketing" className="gap-1"><Megaphone className="w-3 h-3" /> Marketing</TabsTrigger>
          <TabsTrigger value="vehicles" className="gap-1"><Car className="w-3 h-3" /> Vehicles</TabsTrigger>
          <TabsTrigger value="it" className="gap-1"><Monitor className="w-3 h-3" /> IT</TabsTrigger>
          <TabsTrigger value="omnichannel" className="gap-1"><CreditCard className="w-3 h-3" /> Omnichannel</TabsTrigger>
          <TabsTrigger value="ibd" className="gap-1"><TrendingUp className="w-3 h-3" /> IBD</TabsTrigger>
          <TabsTrigger value="hr_transfer" className="gap-1"><Users className="w-3 h-3" /> HR Transfer</TabsTrigger>
        </TabsList>

        {/* All CAPEX */}
        <TabsContent value="all_capex">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All CAPEX Items ({allCapex.length})</CardTitle>
              <p className="text-xs text-muted-foreground">Total: {totalCapex.toLocaleString()} ETB</p>
            </CardHeader>
            <CardContent>
              {CAPEX_SUB_CATEGORIES.map(sub => {
                const subItems = filterBySearch(allCapex).filter(i => (i.capexSubCategory || "Other") === sub);
                if (subItems.length === 0) return null;
                const subTotal = subItems.reduce((s, i) => s + i.totalCost, 0);
                return (
                  <div key={sub} className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{sub}</h4>
                      <span className="text-xs font-medium text-foreground">{subTotal.toLocaleString()} ETB</span>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Source</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Remark</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Unit Cost</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subItems.map(item => (
                          <TableRow key={item.id}>
                            <TableCell className="text-xs">{item.source}</TableCell>
                            <TableCell className="font-medium">{item.libraryItemName}</TableCell>
                            <TableCell><Badge variant="secondary" className="text-[10px]">{item.remark}</Badge></TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{item.unitCost.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-medium">{item.totalCost.toLocaleString()}</TableCell>
                            <TableCell><Badge variant="secondary" className="text-[10px]">{item.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All HR */}
        <TabsContent value="all_hr">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All HR Items ({allHR.length})</CardTitle>
              <p className="text-xs text-muted-foreground">Total: {totalHR.toLocaleString()} ETB</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Remark</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterBySearch(allHR).map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs">{item.source}</TableCell>
                      <TableCell className="font-medium">{item.libraryItemName}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{item.remark}</Badge></TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.unitCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{item.totalCost.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{item.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Direct Expense */}
        <TabsContent value="all_direct">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Direct Expense Items ({allDirect.length})</CardTitle>
              <p className="text-xs text-muted-foreground">Total: {totalDirect.toLocaleString()} ETB</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Remark</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterBySearch(allDirect).map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs">{item.source}</TableCell>
                      <TableCell className="font-medium">{item.libraryItemName}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{item.remark}</Badge></TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.unitCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{item.totalCost.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{item.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketing */}
        <TabsContent value="marketing">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Marketing Budget ({MOCK_DEPT_MARKETING.length})</CardTitle>
              <p className="text-xs text-muted-foreground">Total: {MOCK_DEPT_MARKETING.reduce((s, i) => s + i.totalAmountBirr, 0).toLocaleString()} ETB</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Remark</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total (ETB)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_DEPT_MARKETING.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs">{item.group}</TableCell>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{item.remark}</Badge></TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.unitPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{item.totalAmountBirr.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicles */}
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vehicle Budget ({MOCK_DEPT_VEHICLES.length})</CardTitle>
              <p className="text-xs text-muted-foreground">Total: {MOCK_DEPT_VEHICLES.reduce((s, i) => s + i.totalAmountBirr, 0).toLocaleString()} ETB</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Car Model</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total (ETB)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_DEPT_VEHICLES.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.carModel}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.unitPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{item.totalAmountBirr.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IT */}
        <TabsContent value="it">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">IT Budget ({MOCK_DEPT_IT.length})</CardTitle>
              <p className="text-xs text-muted-foreground">Total (incl VAT): {MOCK_DEPT_IT.reduce((s, i) => s + i.totalWithVat, 0).toLocaleString()} ETB</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Birr Fee</TableHead>
                    <TableHead className="text-right">VAT 15%</TableHead>
                    <TableHead className="text-right">Total (incl VAT)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_DEPT_IT.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs">{item.category}</TableCell>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-xs">{item.department}</TableCell>
                      <TableCell className="text-right">{item.birrFee.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{item.vat15.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{item.totalWithVat.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{item.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Omnichannel */}
        <TabsContent value="omnichannel">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Omnichannel Fees ({MOCK_DEPT_OMNICHANNEL.length})</CardTitle>
              <p className="text-xs text-muted-foreground">Total: {MOCK_DEPT_OMNICHANNEL.reduce((s, i) => s + i.totalAmountBirr, 0).toLocaleString()} ETB</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Total (ETB)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_DEPT_OMNICHANNEL.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.toWhom}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right font-medium">{item.totalAmountBirr.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IBD */}
        <TabsContent value="ibd">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">IBD FX Revenue ({MOCK_DEPT_IBD.length} months)</CardTitle>
              <p className="text-xs text-muted-foreground">Total Projected Inflow: {MOCK_DEPT_IBD.reduce((s, i) => s + i.projectedInflow, 0).toLocaleString()}</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Projected Inflow</TableHead>
                    <TableHead className="text-right">Service Charge</TableHead>
                    <TableHead className="text-right">Net FX Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_DEPT_IBD.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.month}</TableCell>
                      <TableCell className="text-right">{item.projectedInflow.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{item.serviceCharge.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{item.netFxRevenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HR Transfer */}
        <TabsContent value="hr_transfer">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">HR Transfer Positions ({MOCK_DEPT_HR_TRANSFER.length})</CardTitle>
              <p className="text-xs text-muted-foreground">Total: {MOCK_DEPT_HR_TRANSFER.reduce((s, i) => s + i.totalCost, 0).toLocaleString()} ETB</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Total (ETB)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_DEPT_HR_TRANSFER.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.positionName}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.unitCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{item.totalCost.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
