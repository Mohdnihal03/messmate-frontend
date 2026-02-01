import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IndianRupee, TrendingUp, TrendingDown, Users, Receipt, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const recentExpenses = [
  { id: 1, description: "Groceries - Vegetables", amount: 450, paidBy: "Rahul", date: "Today", members: 4 },
  { id: 2, description: "Milk & Bread", amount: 180, paidBy: "Amit", date: "Yesterday", members: 4 },
  { id: 3, description: "Dinner - Biryani", amount: 800, paidBy: "Priya", date: "Jan 28", members: 3 },
  { id: 4, description: "Cooking Gas", amount: 950, paidBy: "Rahul", date: "Jan 27", members: 4 },
];

const balances = [
  { name: "Rahul", balance: 1250, avatar: "R" },
  { name: "Amit", balance: -450, avatar: "A" },
  { name: "Priya", balance: 320, avatar: "P" },
  { name: "Sneha", balance: -1120, avatar: "S" },
];

const weeklyData = [
  { day: "Mon", amount: 450 },
  { day: "Tue", amount: 280 },
  { day: "Wed", amount: 620 },
  { day: "Thu", amount: 350 },
  { day: "Fri", amount: 890 },
  { day: "Sat", amount: 420 },
  { day: "Sun", amount: 560 },
];

const categoryData = [
  { name: "Groceries", value: 4500, color: "hsl(174, 62%, 47%)" },
  { name: "Dining", value: 2800, color: "hsl(174, 62%, 60%)" },
  { name: "Utilities", value: 1500, color: "hsl(174, 62%, 75%)" },
  { name: "Others", value: 800, color: "hsl(174, 62%, 85%)" },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">January 2026 Overview</p>
        </div>
        <Button asChild className="gradient-primary border-0">
          <Link to="/add-expense">
            <Receipt className="w-4 h-4 mr-2" />
            Add Expense
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Monthly Total"
          value="₹9,600"
          subtitle="This month"
          icon={IndianRupee}
          trend="up"
          trendValue="12% vs last month"
        />
        <StatCard
          title="Your Share"
          value="₹2,400"
          subtitle="To be settled"
          icon={TrendingDown}
          variant="warning"
        />
        <StatCard
          title="You Get Back"
          value="₹850"
          subtitle="From 2 members"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Room Members"
          value="4"
          subtitle="Active members"
          icon={Users}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Spending Chart */}
        <Card className="p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Weekly Spending</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`₹${value}`, "Amount"]}
                />
                <Bar dataKey="amount" fill="hsl(174, 62%, 47%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Expense Categories</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`₹${value}`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 ml-4">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Balances */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Member Balances</h3>
            <Link to="/settlement" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {balances.map((member) => (
              <div key={member.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{member.name}</span>
                </div>
                <span
                  className={`font-semibold ${
                    member.balance >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {member.balance >= 0 ? "+" : ""}₹{Math.abs(member.balance)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Expenses */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Expenses</h3>
            <Link to="/monthly-summary" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{expense.description}</p>
                  <p className="text-sm text-muted-foreground">
                    Paid by {expense.paidBy} • {expense.date}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-foreground">₹{expense.amount}</p>
                  <p className="text-xs text-muted-foreground">{expense.members} members</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
