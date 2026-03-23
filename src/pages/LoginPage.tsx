import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, ROLE_LABELS } from "@/types/budget";
import { MOCK_USERS } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Shield, Building2 } from "lucide-react";

const ROLE_GROUPS: { label: string; roles: UserRole[] }[] = [
  {
    label: "Branch Operations",
    roles: ["branch_manager", "district_manager", "branch_management_director", "retail_chief"],
  },
  {
    label: "Department",
    roles: ["department_director", "department_chief"],
  },
  {
    label: "Strategy & Change Management",
    roles: ["strategic_officer", "strategy_director"],
  },
  {
    label: "Oversight & Governance",
    roles: ["budget_hearing_committee", "executive_committee", "board"],
  },
  {
    label: "Administration",
    roles: ["library_admin"],
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("branch_manager");

  const selectedUser = MOCK_USERS.find((u) => u.role === selectedRole);

  const handleLogin = () => {
    login(selectedRole);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-accent/5" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-accent/5" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Logo / Brand */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Budget Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Zemen Bank Budget Planning & Approval System
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/60 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>
              Select a role to simulate and explore the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Mock email field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={selectedUser?.name.toLowerCase().replace(/\s/g, ".") + "@zemenbank.com" || ""}
                readOnly
                className="bg-muted/50 text-muted-foreground"
              />
            </div>

            {/* Role selector */}
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_GROUPS.map((group) => (
                    <div key={group.label}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {group.label}
                      </div>
                      {group.roles.map((role) => {
                        const user = MOCK_USERS.find((u) => u.role === role);
                        return (
                          <SelectItem key={role} value={role}>
                            <span className="flex items-center gap-2">
                              <Shield className="h-3 w-3 text-muted-foreground" />
                              {ROLE_LABELS[role]}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User info preview */}
            {selectedUser && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium text-foreground">{selectedUser.name}</span>
                </div>
                {selectedUser.branch && (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-muted-foreground">Branch</span>
                    <span className="text-foreground">{selectedUser.branch}</span>
                  </div>
                )}
                {selectedUser.district && (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-muted-foreground">District</span>
                    <span className="text-foreground">{selectedUser.district}</span>
                  </div>
                )}
                {selectedUser.department && (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-muted-foreground">Department</span>
                    <span className="text-foreground">{selectedUser.department}</span>
                  </div>
                )}
              </div>
            )}

            {/* Login button */}
            <Button
              onClick={handleLogin}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              size="lg"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In as {ROLE_LABELS[selectedRole]}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          This is a simulation environment. No real credentials are required.
        </p>
      </div>
    </div>
  );
}
