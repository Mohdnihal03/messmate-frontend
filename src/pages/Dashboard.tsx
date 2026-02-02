import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IndianRupee, TrendingUp, TrendingDown, Users, Receipt, ArrowRight, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { getExpensesByRoom, getRoomsByUser } from "@/services/api";

const COLORS = [
  "hsl(174, 62%, 47%)", // Primary
  "hsl(174, 62%, 60%)",
  "hsl(174, 62%, 75%)",
  "hsl(174, 62%, 85%)",
];

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 1. Fetch User's Rooms
  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms', user?.id],
    queryFn: () => getRoomsByUser(user!.id),
    enabled: !!user?.id,
  });

  const activeRoom = roomsData?.docs?.[0];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (!authLoading && user && roomsData && roomsData.docs.length === 0) {
      navigate('/room-setup');
    }
  }, [user, authLoading, roomsData, navigate]);

  // 2. Fetch Expenses for the Active Room
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', activeRoom?.id],
    queryFn: () => getExpensesByRoom(activeRoom.id),
    enabled: !!activeRoom?.id,
  });

  if (authLoading || roomsLoading || expensesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activeRoom) {
    return null; // Will redirect in useEffect
  }

  // --- Calculations ---
  const expenses = expensesData?.docs || [];
  const members = activeRoom.members || [];
  const memberCount = members.length;

  // Calculate generic stats
  const totalAmount = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

  // Helper to get ID consistently
  const getId = (doc: any) => (typeof doc === 'string' ? doc : doc?.id);

  // Precise Calculation per Member
  const calculateMemberStats = (memberId: string) => {
    let paid = 0;
    let share = 0;

    expenses.forEach((exp: any) => {
      // Paid
      if (getId(exp.paidBy) === memberId) {
        paid += exp.amount;
      }

      // Share
      const membersPresent = exp.membersPresent || [];
      const isPresent = membersPresent.some((m: any) => getId(m) === memberId);
      if (isPresent && membersPresent.length > 0) {
        share += exp.amount / membersPresent.length;
      }
    });

    return { paid, share, balance: paid - share };
  };

  // My Stats
  const myStats = calculateMemberStats(user?.id);
  const myShare = myStats.share;
  const balance = myStats.balance;

  // Recent 5 expenses
  const recentExpenses = expenses.slice(0, 5).map((exp: any) => ({
    id: exp.id,
    description: exp.description,
    amount: exp.amount,
    paidBy: typeof exp.paidBy === 'object' ? exp.paidBy.name : 'User',
    date: new Date(exp.date).toLocaleDateString(),
    members: exp.membersPresent?.length || 0
  }));

  // Member Balances Calculation
  const memberBalances = members.map((member: any) => {
    const memberId = getId(member);
    const memberName = typeof member === 'object' ? member.name : 'Member';
    const stats = calculateMemberStats(memberId);

    return {
      name: memberName,
      balance: Math.round(stats.balance),
      avatar: typeof member === 'object' && member.avatar ? member.avatar : memberName.charAt(0),
    };
  });

  // Prepare Chart Data
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach((exp: any) => {
    expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
  });

  const categoryData = Object.keys(expensesByCategory).map((key, index) => ({
    name: key,
    value: expensesByCategory[key],
    color: COLORS[index % COLORS.length]
  }));

  // Weekly Data (Mock logic or real aggregation needed)
  // For now, let's keep it simple or implement a quick aggregation if time permits
  // Or just mock it for visual structure if real data isn't enough yet
  // Weekly Data Aggregation
  const weeklyData = [
    { day: "Sun", amount: 0 }, { day: "Mon", amount: 0 }, { day: "Tue", amount: 0 },
    { day: "Wed", amount: 0 }, { day: "Thu", amount: 0 }, { day: "Fri", amount: 0 }, { day: "Sat", amount: 0 },
  ];

  expenses.forEach((exp: any) => {
    const date = new Date(exp.date);
    // Ensure we only sum expenses from this week/recent period if preferred, 
    // but for dashboard showing trends, all-time by day is sometimes used, 
    // or filtering to current week is better. 
    // For simplicity, we aggregate ALL visible expenses by day of week.
    const dayIndex = date.getDay(); // 0 = Sun
    weeklyData[dayIndex].amount += exp.amount;
  });

  // Rotate so Mon is first? (Optional, currently Sun is first in array).
  // If UI wants Mon first:
  // const reorderedWeekly = [...weeklyData.slice(1), weeklyData[0]];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">{activeRoom.name}</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-mono flex items-center">
            Code: {activeRoom.inviteCode}
          </div>
          <Button asChild className="gradient-primary border-0">
            <Link to="/add-expense">
              <Receipt className="w-4 h-4 mr-2" />
              Add Expense
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Monthly Total"
          value={`₹${totalAmount.toLocaleString()}`}
          subtitle="Total expenses"
          icon={IndianRupee}
          trend="neutral"
          trendValue="Updated just now"
        />
        <StatCard
          title="Your Share"
          value={`₹${Math.round(myShare).toLocaleString()}`}
          subtitle="Per person split"
          icon={TrendingDown}
          variant="warning"
        />
        <StatCard
          title={balance >= 0 ? "You Get Back" : "You Owe"}
          value={`₹${Math.abs(Math.round(balance)).toLocaleString()}`}
          subtitle={balance >= 0 ? "Others owe you" : "Settle up soon"}
          icon={balance >= 0 ? TrendingUp : TrendingDown}
          variant={balance >= 0 ? "success" : "destructive"}
        />
        <StatCard
          title="Room Members"
          value={memberCount.toString()}
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
            {categoryData.length > 0 ? (
              <>
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
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No expenses yet
              </div>
            )}
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
            {memberBalances.map((member) => (
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
                  className={`font-semibold ${member.balance >= 0 ? "text-success" : "text-destructive"
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
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense: any) => (
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
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No recent expenses
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
