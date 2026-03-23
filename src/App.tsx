import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import BudgetListPage from "@/pages/BudgetListPage";
import BudgetDetailPage from "@/pages/BudgetDetailPage";
import BudgetCreatePage from "@/pages/BudgetCreatePage";
import BudgetEditPage from "@/pages/BudgetEditPage";
import ApprovalsPage from "@/pages/ApprovalsPage";
import LibraryPage from "@/pages/LibraryPage";
import MarketingBudgetPage from "@/pages/MarketingBudgetPage";
import PropertyBudgetPage from "@/pages/PropertyBudgetPage";
import ProcurementBudgetPage from "@/pages/ProcurementBudgetPage";
import ITBudgetPage from "@/pages/ITBudgetPage";
import OmnichannelBudgetPage from "@/pages/OmnichannelBudgetPage";
import IBDBudgetPage from "@/pages/IBDBudgetPage";
import HumanCapitalBudgetPage from "@/pages/HumanCapitalBudgetPage";
import ConsolidatedBudgetPage from "@/pages/ConsolidatedBudgetPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/budgets" element={<BudgetListPage />} />
        <Route path="/budgets/new" element={<BudgetCreatePage />} />
        <Route path="/budgets/:id" element={<BudgetDetailPage />} />
        <Route path="/budgets/:id/edit" element={<BudgetEditPage />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/consolidated" element={<ConsolidatedBudgetPage />} />
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
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
