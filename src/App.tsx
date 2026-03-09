import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import BudgetListPage from "@/pages/BudgetListPage";
import BudgetDetailPage from "@/pages/BudgetDetailPage";
import BudgetCreatePage from "@/pages/BudgetCreatePage";
import ApprovalsPage from "@/pages/ApprovalsPage";
import LibraryPage from "@/pages/LibraryPage";
import MarketingBudgetPage from "@/pages/MarketingBudgetPage";
import PropertyBudgetPage from "@/pages/PropertyBudgetPage";
import ProcurementBudgetPage from "@/pages/ProcurementBudgetPage";
import ITBudgetPage from "@/pages/ITBudgetPage";
import OmnichannelBudgetPage from "@/pages/OmnichannelBudgetPage";
import IBDBudgetPage from "@/pages/IBDBudgetPage";
import HumanCapitalBudgetPage from "@/pages/HumanCapitalBudgetPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/budgets" element={<BudgetListPage />} />
              <Route path="/budgets/new" element={<BudgetCreatePage />} />
              <Route path="/budgets/:id" element={<BudgetDetailPage />} />
              <Route path="/approvals" element={<ApprovalsPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/dept/marketing" element={<MarketingBudgetPage />} />
              <Route path="/dept/property" element={<PropertyBudgetPage />} />
              <Route path="/dept/procurement" element={<ProcurementBudgetPage />} />
              <Route path="/dept/it" element={<ITBudgetPage />} />
              <Route path="/dept/omnichannel" element={<OmnichannelBudgetPage />} />
              <Route path="/dept/ibd" element={<IBDBudgetPage />} />
              <Route path="/dept/human-capital" element={<HumanCapitalBudgetPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
