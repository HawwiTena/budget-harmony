import { useAuth } from "@/contexts/AuthContext";
import { UserRole, ROLE_LABELS } from "@/types/budget";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Library,
  CheckSquare,
  Megaphone,
  Car,
  Package,
  Monitor,
  CreditCard,
  TrendingUp,
  Users,
  User,
  Layers,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLES: UserRole[] = [
  "branch_manager",
  "district_manager",
  "branch_management_director",
  "retail_chief",
  "strategic_officer",
  "strategy_director",
  "department_director",
  "department_chief",
  "budget_hearing_committee",
  "executive_committee",
  "board",
];

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[];
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Budget Requests", href: "/budgets", icon: FileText },
  { label: "Consolidated View", href: "/consolidated", icon: Layers, roles: ["strategy_director", "department_chief", "budget_hearing_committee", "executive_committee", "board"] },
  { label: "Approvals", href: "/approvals", icon: CheckSquare, roles: ["district_manager", "branch_management_director", "retail_chief", "strategy_director", "department_chief", "budget_hearing_committee", "executive_committee", "board"] },
  { label: "Budget Library", href: "/library", icon: Library, roles: ["strategic_officer", "strategy_director"] },
];

const DEPT_NAV_ITEMS: NavItem[] = [
  { label: "Marketing", href: "/dept/marketing", icon: Megaphone, section: "dept" },
  { label: "Property — Vehicles", href: "/dept/property", icon: Car, section: "dept" },
  { label: "Procurement CAPEX", href: "/dept/procurement", icon: Package, section: "dept" },
  { label: "IT Budget", href: "/dept/it", icon: Monitor, section: "dept" },
  { label: "Omnichannel Fees", href: "/dept/omnichannel", icon: CreditCard, section: "dept" },
  { label: "IBD — FX Revenue", href: "/dept/ibd", icon: TrendingUp, section: "dept" },
  { label: "Human Capital — HR", href: "/dept/human-capital", icon: Users, section: "dept" },
];

export default function AppSidebar() {
  const { currentUser, setRole, roleLabel } = useAuth();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter(
    item => !item.roles || item.roles.includes(currentUser.role)
  );

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-display font-bold text-sm">B</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-foreground text-base tracking-tight">BudgetFlow</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Budget Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        {/* Department Budgets Section */}
        <div className="pt-4 pb-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium px-3 mb-2">
            Departmental Budgets
          </p>
        </div>
        {DEPT_NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Role Switcher (Demo) */}
      <div className="p-4 border-t border-border space-y-3">
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          Switch Role (Demo)
        </label>
        <Select value={currentUser.role} onValueChange={(v) => setRole(v as UserRole)}>
          <SelectTrigger className="w-full text-xs h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map(role => (
              <SelectItem key={role} value={role} className="text-xs">
                {ROLE_LABELS[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* User Info */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{roleLabel}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
