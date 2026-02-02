import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getExpensesByRoom, getRoomsByUser } from "@/services/api";
import { format, startOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function MonthlySummary() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>(startOfMonth(new Date()).toISOString());
  const [viewImage, setViewImage] = useState<string | null>(null);

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${url}`;
  };

  // 1. Fetch Rooms (to get active room)
  const { data: roomsData } = useQuery({
    queryKey: ['rooms', user?.id],
    queryFn: () => getRoomsByUser(user!.id),
    enabled: !!user?.id,
  });
  const activeRoom = roomsData?.docs?.[0];

  // 2. Fetch Expenses for Selected Month
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', activeRoom?.id, selectedMonth],
    queryFn: () => getExpensesByRoom(activeRoom.id, selectedMonth),
    enabled: !!activeRoom?.id,
  });

  const expenses = expensesData?.docs || [];
  const totalExpenses = expenses.reduce((sum: number, ex: any) => sum + ex.amount, 0);

  // 3. Calculate Member Balances
  const members = activeRoom?.members || [];
  const memberStats = members.map((member: any) => {
    // If member is just ID string, we can't show name easily unless populated. 
    // API depth=1 should populate it.
    const memberId = member.id || member;

    let paid = 0;
    let share = 0;

    expenses.forEach((ex: any) => {
      // Paid
      if ((ex.paidBy.id || ex.paidBy) === memberId) {
        paid += ex.amount;
      }

      // Share
      const isPresent = ex.membersPresent.some((m: any) => (m.id || m) === memberId);
      if (isPresent) {
        share += ex.amount / ex.membersPresent.length;
      }
    });

    return {
      id: memberId,
      name: member.name || "Unknown",
      avatar: member.avatar || (member.name?.[0] || "?"),
      totalPaid: paid,
      totalShare: share,
      balance: paid - share,
    };
  });

  // Helper to generate month options
  const getMonthOptions = () => {
    const options = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = startOfMonth(d); // Reset to 1st of month 00:00:00
      options.push({
        value: start.toISOString(),
        label: format(start, 'MMMM yyyy')
      });
    }
    return options;
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monthly Summary</h1>
          <p className="text-muted-foreground">Detailed breakdown of expenses</p>
        </div>
        <Select
          value={selectedMonth}
          onValueChange={setSelectedMonth}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {getMonthOptions().map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Total Card */}
      <Card className="p-6 mb-6 gradient-primary text-primary-foreground shadow-card">
        <div className="text-center">
          <p className="text-primary-foreground/80 mb-1">Total Expenses</p>
          <p className="text-4xl font-bold">₹{totalExpenses.toLocaleString()}</p>
          <p className="text-primary-foreground/80 mt-2">
            Split between {members.length} members
          </p>
        </div>
      </Card>

      {/* Member Summary Table */}
      <Card className="p-6 shadow-card mb-6 animate-fade-in">
        <h3 className="font-semibold text-foreground mb-4">Member Summary</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead className="text-right">Total Paid</TableHead>
                <TableHead className="text-right">Share</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberStats.map((member: any) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{member.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ₹{member.totalShare.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      member.balance > 0 && "text-success",
                      member.balance < 0 && "text-destructive",
                      Math.abs(member.balance) < 1 && "text-muted-foreground"
                    )}
                  >
                    {member.balance > 0 && "+"}₹{Math.abs(member.balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        member.balance > 10
                          ? "default"
                          : member.balance < -10
                            ? "destructive"
                            : "secondary"
                      }
                      className={cn(
                        member.balance > 10 && "bg-success text-success-foreground",
                        Math.abs(member.balance) <= 10 && "bg-muted text-muted-foreground"
                      )}
                    >
                      {member.balance > 10 ? "Gets back" : member.balance < -10 ? "Owes" : "Settled"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Expense History */}
      <Card className="p-6 shadow-card animate-fade-in">
        <h3 className="font-semibold text-foreground mb-4">Expense History</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Paid By</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Split</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length > 0 ? (
                expenses.map((expense: any) => (
                  <TableRow key={expense.id}>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(expense.date), "MMM d")}
                    </TableCell>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{expense.paidBy?.name || "Unknown"}</TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{expense.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {expense.membersPresent?.length || 0} people
                    </TableCell>
                    <TableCell className="text-right">
                      {expense.billImage && expense.billImage.url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewImage(getImageUrl(expense.billImage.url))}
                        >
                          <FileText className="w-4 h-4 text-primary" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No expenses found for this month.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Receipt View</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            {viewImage && (
              <img
                src={viewImage}
                alt="Receipt"
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
