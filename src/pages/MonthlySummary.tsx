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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const summaryData = [
  {
    id: "1",
    name: "Rahul",
    avatar: "R",
    totalPaid: 4500,
    totalShare: 2400,
    balance: 2100,
  },
  {
    id: "2",
    name: "Amit",
    avatar: "A",
    totalPaid: 1800,
    totalShare: 2400,
    balance: -600,
  },
  {
    id: "3",
    name: "Priya",
    avatar: "P",
    totalPaid: 2400,
    totalShare: 2400,
    balance: 0,
  },
  {
    id: "4",
    name: "Sneha",
    avatar: "S",
    totalPaid: 900,
    totalShare: 2400,
    balance: -1500,
  },
];

const expenseHistory = [
  { id: 1, date: "Jan 30", description: "Groceries - Vegetables", amount: 450, paidBy: "Rahul", splitBetween: 4 },
  { id: 2, date: "Jan 29", description: "Milk & Bread", amount: 180, paidBy: "Amit", splitBetween: 4 },
  { id: 3, date: "Jan 28", description: "Dinner - Biryani", amount: 800, paidBy: "Priya", splitBetween: 3 },
  { id: 4, date: "Jan 27", description: "Cooking Gas", amount: 950, paidBy: "Rahul", splitBetween: 4 },
  { id: 5, date: "Jan 26", description: "Snacks & Drinks", amount: 320, paidBy: "Sneha", splitBetween: 4 },
  { id: 6, date: "Jan 25", description: "Rice & Dal", amount: 680, paidBy: "Rahul", splitBetween: 4 },
  { id: 7, date: "Jan 24", description: "Fruits", amount: 250, paidBy: "Priya", splitBetween: 2 },
  { id: 8, date: "Jan 23", description: "Dinner - Pizza", amount: 1200, paidBy: "Amit", splitBetween: 4 },
];

export default function MonthlySummary() {
  const totalExpenses = summaryData.reduce((sum, m) => sum + m.totalPaid, 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monthly Summary</h1>
          <p className="text-muted-foreground">Detailed breakdown of expenses</p>
        </div>
        <Select defaultValue="jan-2026">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jan-2026">January 2026</SelectItem>
            <SelectItem value="dec-2025">December 2025</SelectItem>
            <SelectItem value="nov-2025">November 2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Total Card */}
      <Card className="p-6 mb-6 gradient-primary text-primary-foreground shadow-card">
        <div className="text-center">
          <p className="text-primary-foreground/80 mb-1">Total Expenses This Month</p>
          <p className="text-4xl font-bold">₹{totalExpenses.toLocaleString()}</p>
          <p className="text-primary-foreground/80 mt-2">Split between 4 members</p>
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
              {summaryData.map((member) => (
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
                    ₹{member.totalPaid.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ₹{member.totalShare.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      member.balance > 0 && "text-success",
                      member.balance < 0 && "text-destructive",
                      member.balance === 0 && "text-muted-foreground"
                    )}
                  >
                    {member.balance > 0 && "+"}₹{Math.abs(member.balance).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        member.balance > 0
                          ? "default"
                          : member.balance < 0
                          ? "destructive"
                          : "secondary"
                      }
                      className={cn(
                        member.balance > 0 && "bg-success text-success-foreground",
                        member.balance === 0 && "bg-muted text-muted-foreground"
                      )}
                    >
                      {member.balance > 0 ? "Gets back" : member.balance < 0 ? "Owes" : "Settled"}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseHistory.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-muted-foreground">{expense.date}</TableCell>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>{expense.paidBy}</TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{expense.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {expense.splitBetween} people
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
