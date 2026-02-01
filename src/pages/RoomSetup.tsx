import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, KeyRound } from "lucide-react";

export default function RoomSetup() {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">MessMate</span>
        </div>

        {mode === "choose" && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Set up your room
            </h1>
            <p className="text-muted-foreground mb-8">
              Create a new room or join an existing one
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setMode("create")}
                className="w-full p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-accent transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Create a Room</p>
                    <p className="text-sm text-muted-foreground">
                      Start fresh with a new room for your PG
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode("join")}
                className="w-full p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-accent transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Join a Room</p>
                    <p className="text-sm text-muted-foreground">
                      Enter an invite code to join existing room
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {mode === "create" && (
          <div>
            <button
              onClick={() => setMode("choose")}
              className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Create a new room
            </h1>
            <p className="text-muted-foreground mb-8">
              Set up your room and invite your roommates
            </p>

            <form className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  type="text"
                  placeholder="e.g., Sunrise PG - Room 204"
                  className="h-11"
                />
              </div>

              <Button asChild className="w-full h-11 gradient-primary border-0">
                <Link to="/dashboard">Create Room</Link>
              </Button>
            </form>
          </div>
        )}

        {mode === "join" && (
          <div>
            <button
              onClick={() => setMode("choose")}
              className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Join a room
            </h1>
            <p className="text-muted-foreground mb-8">
              Enter the invite code shared by your roommate
            </p>

            <form className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Invite Code</Label>
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="e.g., ABC123"
                  className="h-11 uppercase tracking-widest text-center font-mono"
                />
              </div>

              <Button asChild className="w-full h-11 gradient-primary border-0">
                <Link to="/dashboard">Join Room</Link>
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
