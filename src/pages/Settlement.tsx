import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

const settlements = [
  {
    id: 1,
    from: { name: "Sneha", avatar: "S" },
    to: { name: "Rahul", avatar: "R" },
    amount: 1500,
    status: "pending",
  },
  {
    id: 2,
    from: { name: "Amit", avatar: "A" },
    to: { name: "Rahul", avatar: "R" },
    amount: 600,
    status: "pending",
  },
];

const settledPayments = [
  {
    id: 3,
    from: { name: "Priya", avatar: "P" },
    to: { name: "Rahul", avatar: "R" },
    amount: 320,
    status: "completed",
    date: "Jan 25, 2026",
  },
];

const balanceSummary = [
  { name: "Rahul", avatar: "R", owes: 0, getsBack: 2100 },
  { name: "Amit", avatar: "A", owes: 600, getsBack: 0 },
  { name: "Priya", avatar: "P", owes: 0, getsBack: 0 },
  { name: "Sneha", avatar: "S", owes: 1500, getsBack: 0 },
];

export default function Settlement() {
  const totalPending = settlements.reduce((sum, s) => sum + s.amount, 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settlement</h1>
        <p className="text-muted-foreground">Settle up with your roommates</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-5 shadow-card bg-warning/10 border-warning/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-warning/20">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Settlements</p>
              <p className="text-2xl font-bold text-foreground">₹{totalPending.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <IndianRupee className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold text-foreground">{settlements.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-card bg-success/10 border-success/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-success/20">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Settled This Month</p>
              <p className="text-2xl font-bold text-foreground">₹320</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Settlements */}
      <Card className="p-6 shadow-card mb-6 animate-fade-in">
        <h3 className="font-semibold text-foreground mb-4">Pending Settlements</h3>
        {settlements.length > 0 ? (
          <div className="space-y-4">
            {settlements.map((settlement) => (
              <div
                key={settlement.id}
                className="flex items-center justify-between p-4 rounded-xl bg-accent/50 border"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-10 h-10 border-2 border-background">
                      <AvatarFallback className="bg-destructive/10 text-destructive font-medium">
                        {settlement.from.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{settlement.from.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ArrowRight className="w-4 h-4" />
                    <span className="font-bold text-foreground">₹{settlement.amount.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Avatar className="w-10 h-10 border-2 border-background">
                      <AvatarFallback className="bg-success/10 text-success font-medium">
                        {settlement.to.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{settlement.to.name}</span>
                  </div>
                </div>

                <Button size="sm" className="gradient-primary border-0">
                  Mark as Paid
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-success" />
            <p>All settled up! No pending payments.</p>
          </div>
        )}
      </Card>

      {/* Balance Summary */}
      <Card className="p-6 shadow-card mb-6 animate-fade-in">
        <h3 className="font-semibold text-foreground mb-4">Balance Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {balanceSummary.map((member) => (
            <div
              key={member.name}
              className={cn(
                "p-4 rounded-xl border",
                member.getsBack > 0 && "bg-success/5 border-success/20",
                member.owes > 0 && "bg-destructive/5 border-destructive/20",
                member.owes === 0 && member.getsBack === 0 && "bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {member.avatar}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-foreground">{member.name}</span>
              </div>
              {member.getsBack > 0 && (
                <p className="text-success font-medium">
                  Gets back ₹{member.getsBack.toLocaleString()}
                </p>
              )}
              {member.owes > 0 && (
                <p className="text-destructive font-medium">
                  Owes ₹{member.owes.toLocaleString()}
                </p>
              )}
              {member.owes === 0 && member.getsBack === 0 && (
                <p className="text-muted-foreground">All settled</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Settled Payments */}
      <Card className="p-6 shadow-card animate-fade-in">
        <h3 className="font-semibold text-foreground mb-4">Recently Settled</h3>
        {settledPayments.length > 0 ? (
          <div className="space-y-3">
            {settledPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-foreground">
                    <span className="font-medium">{payment.from.name}</span> paid{" "}
                    <span className="font-medium">{payment.to.name}</span>
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">₹{payment.amount}</p>
                  <p className="text-xs text-muted-foreground">{payment.date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">No recent settlements</p>
        )}
      </Card>
    </DashboardLayout>
  );
}
