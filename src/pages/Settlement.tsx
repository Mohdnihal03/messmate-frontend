import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpensesByRoom, getSettlementsByRoom, getRoomsByUser, createSettlement } from "@/services/api";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Settlement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch Data
  const { data: roomsData } = useQuery({
    queryKey: ['rooms', user?.id],
    queryFn: () => getRoomsByUser(user!.id),
    enabled: !!user?.id,
  });
  const activeRoom = roomsData?.docs?.[0];

  const { data: expensesData } = useQuery({
    queryKey: ['expenses', activeRoom?.id, 'all'],
    queryFn: () => getExpensesByRoom(activeRoom.id), // No month arg = all months
    enabled: !!activeRoom?.id,
  });

  const { data: settlementsData } = useQuery({
    queryKey: ['settlements', activeRoom?.id],
    queryFn: () => getSettlementsByRoom(activeRoom.id),
    enabled: !!activeRoom?.id,
  });

  const expenses = expensesData?.docs || [];
  const settlements = settlementsData?.docs || [];
  const members = activeRoom?.members || [];

  // 2. Calculate Net Balances
  const balances: Record<string, number> = {};

  // Initialize
  members.forEach((m: any) => {
    const id = m.id || m;
    balances[id] = 0;
  });

  // Process Expenses
  expenses.forEach((ex: any) => {
    const payerId = ex.paidBy.id || ex.paidBy;
    const amount = ex.amount;
    const splitCount = ex.membersPresent.length;

    // Payer gets back full amount (credit)
    if (balances[payerId] !== undefined) balances[payerId] += amount;

    // Each member present owes their share (debit)
    ex.membersPresent.forEach((m: any) => {
      const mId = m.id || m;
      if (balances[mId] !== undefined) balances[mId] -= (amount / splitCount);
    });
  });

  // Process Completed Settlements
  settlements.forEach((s: any) => {
    const fromId = s.from.id || s.from;
    const toId = s.to.id || s.to;
    const amount = s.amount;

    // Payer (From) has Paid, so their balance INCREASES (less debt)
    if (balances[fromId] !== undefined) balances[fromId] += amount;

    // Receiver (To) has Received, so their balance DECREASES (less credit)
    if (balances[toId] !== undefined) balances[toId] -= amount;
  });

  // 3. Simplify Debt Algorithm
  const debtors = [];
  const creditors = [];

  for (const [id, amount] of Object.entries(balances)) {
    if (amount < -1) debtors.push({ id, amount }); // Using -1 to ignore tiny rounding errors
    if (amount > 1) creditors.push({ id, amount });
  }

  debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
  creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

  const pendingSettlements = [];
  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    // Amount to settle is min of abs(debt) and credit
    const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

    if (amount > 1) { // Ignore small amounts
      pendingSettlements.push({
        from: members.find((m: any) => (m.id || m) === debtor.id),
        to: members.find((m: any) => (m.id || m) === creditor.id),
        amount: amount
      });
    }

    // Adjust remaining
    debtor.amount += amount;
    creditor.amount -= amount;

    if (Math.abs(debtor.amount) < 1) i++;
    if (creditor.amount < 1) j++;
  }

  // 4. Mutation
  const settleMutation = useMutation({
    mutationFn: createSettlement,
    onSuccess: () => {
      toast.success("Settlement recorded!");
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
    },
    onError: () => toast.error("Failed to record settlement")
  });

  const handleSettle = (settlement: any) => {
    settleMutation.mutate({
      from: settlement.from.id || settlement.from,
      to: settlement.to.id || settlement.to,
      amount: Math.round(settlement.amount),
      room: activeRoom.id,
      status: 'completed' // Assuming immediate settlement for now
    });
  };

  const totalPending = pendingSettlements.reduce((sum, s) => sum + s.amount, 0);
  const settledThisMonth = settlements
    .filter((s: any) => new Date(s.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum: number, s: any) => sum + s.amount, 0);

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
              <p className="text-2xl font-bold text-foreground">₹{totalPending.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <IndianRupee className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Past Transactions</p>
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
              <p className="text-2xl font-bold text-foreground">₹{settledThisMonth.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Settlements */}
      <Card className="p-6 shadow-card mb-6 animate-fade-in">
        <h3 className="font-semibold text-foreground mb-4">Suggested Settlements</h3>
        {pendingSettlements.length > 0 ? (
          <div className="space-y-4">
            {pendingSettlements.map((settlement, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-xl bg-accent/50 border"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-10 h-10 border-2 border-background">
                      <AvatarFallback className="bg-destructive/10 text-destructive font-medium">
                        {settlement.from?.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{settlement.from?.name || "Unknown"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ArrowRight className="w-4 h-4" />
                    <span className="font-bold text-foreground">₹{Math.round(settlement.amount).toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Avatar className="w-10 h-10 border-2 border-background">
                      <AvatarFallback className="bg-success/10 text-success font-medium">
                        {settlement.to?.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{settlement.to?.name || "Unknown"}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="gradient-primary border-0"
                  onClick={() => handleSettle(settlement)}
                  disabled={settleMutation.isPending}
                >
                  {settleMutation.isPending ? "Settling..." : "Mark as Paid"}
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
        <h3 className="font-semibold text-foreground mb-4">Current Net Balances</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {members.map((member: any) => {
            const bal = balances[member.id || member] || 0;
            return (
              <div
                key={member.id}
                className={cn(
                  "p-4 rounded-xl border",
                  bal > 10 && "bg-success/5 border-success/20",
                  bal < -10 && "bg-destructive/5 border-destructive/20",
                  Math.abs(bal) <= 10 && "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {member.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-foreground">{member.name || "Unknown"}</span>
                </div>
                {bal > 10 && (
                  <p className="text-success font-medium">
                    Gets back ₹{Math.round(bal).toLocaleString()}
                  </p>
                )}
                {bal < -10 && (
                  <p className="text-destructive font-medium">
                    Owes ₹{Math.round(Math.abs(bal)).toLocaleString()}
                  </p>
                )}
                {Math.abs(bal) <= 10 && (
                  <p className="text-muted-foreground">All settled</p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Settled Payments */}
      <Card className="p-6 shadow-card animate-fade-in">
        <h3 className="font-semibold text-foreground mb-4">Past Settlements</h3>
        {settlements.length > 0 ? (
          <div className="space-y-3">
            {settlements.map((payment: any) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-foreground">
                    <span className="font-medium">{payment.from?.name || "Unknown"}</span> paid{" "}
                    <span className="font-medium">{payment.to?.name || "Unknown"}</span>
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">₹{payment.amount}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(payment.createdAt), "MMM d")}</p>
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
