import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Receipt, PieChart, ArrowLeftRight, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "Track Daily Expenses",
    description: "Log food costs, upload bills, and keep everything organized",
  },
  {
    icon: Users,
    title: "Split Smartly",
    description: "Select who was present for each meal and split costs fairly",
  },
  {
    icon: PieChart,
    title: "Monthly Insights",
    description: "View detailed breakdowns and spending patterns",
  },
  {
    icon: ArrowLeftRight,
    title: "Easy Settlements",
    description: "Know exactly who owes whom and settle up quickly",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">MessMate</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild className="gradient-primary border-0">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            Free for PG & Hostel residents
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in">
            Split shared expenses
            <span className="block gradient-primary bg-clip-text text-transparent text-black">
              without the headache
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            MessMate helps PG and hostel residents track daily food costs, upload bills,
            and automatically calculate who owes what at month-end.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Button asChild size="lg" className="h-12 px-8 gradient-primary border-0 text-base">
              <Link to="/signup">Start for Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need to manage shared expenses
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple, intuitive tools designed for non-technical users living in shared spaces
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="gradient-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to simplify expense sharing?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join thousands of PG residents who have made monthly settlements stress-free.
            </p>
            <Button asChild size="lg" variant="secondary" className="h-12 px-8">
              <Link to="/signup">Create Your Room</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2026 MessMate. Built for shared living, made simple.</p>
        </div>
      </footer>
    </div>
  );
}
