import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">MessMate</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-11"
              />
            </div>

            <Button asChild className="w-full h-11 gradient-primary border-0">
              <Link to="/dashboard">Sign in</Link>
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12">
        <div className="max-w-md text-center text-primary-foreground">
          <div className="w-20 h-20 bg-primary-foreground/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Users className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Split expenses effortlessly
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Track daily food costs, upload bills, and settle up with your roommates at the end of each month.
          </p>
        </div>
      </div>
    </div>
  );
}
