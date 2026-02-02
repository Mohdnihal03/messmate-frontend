import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import {
    Users,
    Receipt,
    ArrowLeftRight,
    Settings,
    CheckCircle,
    HelpCircle,
    Plus
} from "lucide-react";

export default function Help() {
    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">How to use MessBro</h1>
                <p className="text-muted-foreground">Quick guide to managing your shared expenses</p>
            </div>

            <div className="space-y-6 max-w-4xl">
                {/* 1. Getting Started */}
                <Card className="p-6 shadow-card">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 mt-1">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">1. Getting Started</h3>
                            <ul className="space-y-3 text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Create a Room:</strong> Sign up and create a new room for your flat/hostel. You'll become the Admin.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Invite Members:</strong> Go to <em>Room Settings</em> and copy the Invite Code. Share it with roommates so they can join.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>

                {/* 2. Adding Expenses */}
                <Card className="p-6 shadow-card">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 mt-1">
                            <Receipt className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">2. Adding Expenses</h3>
                            <p className="text-muted-foreground mb-4">
                                Whenever you buy something for the room (groceries, food, bills), add it to MessBro.
                            </p>
                            <ul className="space-y-3 text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">1</div>
                                    <span>Click <strong>Add Expense</strong> in the sidebar.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">2</div>
                                    <span>Enter the amount and description (e.g., "Vegetables").</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">3</div>
                                    <span>
                                        <strong>Select Members:</strong> Choose who was involved.
                                        <br />
                                        <em className="text-sm">- For common items (Oil, Gas), select Everyone.</em>
                                        <br />
                                        <em className="text-sm">- For personal meals, select only those who ate.</em>
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">4</div>
                                    <span>(Optional) Upload a photo of the bill for proof.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>

                {/* 3. Settling Up */}
                <Card className="p-6 shadow-card">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 mt-1">
                            <ArrowLeftRight className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">3. Settling Balances</h3>
                            <p className="text-muted-foreground mb-4">
                                At the end of the month (or anytime), check who owes whom.
                            </p>
                            <ul className="space-y-3 text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                                    <span>
                                        Go to <strong>Settlement</strong> page to see "Suggested Settlements".
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                                    <span>
                                        If prompted <em>"Rahul owes Amit ₹500"</em>, Rahul should pay Amit (via UPI/Cash).
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                                    <span>
                                        Once paid, click <strong>Mark as Paid</strong> to clear the debt from the app.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>

                {/* 4. Admin Features */}
                <Card className="p-6 shadow-card">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 mt-1">
                            <Settings className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">4. Managing the Room</h3>
                            <ul className="space-y-3 text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Room Settings:</strong> View your Invite Code or rename the room.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Transfer Admin:</strong> If you are moving out, you can make someone else the Admin via the Room Settings page.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
