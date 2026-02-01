import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  Check, 
  UserPlus, 
  Settings, 
  Users, 
  LogOut,
  Crown,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

const members = [
  { id: "1", name: "Rahul Sharma", email: "rahul@email.com", avatar: "R", role: "admin", joinedDate: "Jan 10, 2026" },
  { id: "2", name: "Amit Patel", email: "amit@email.com", avatar: "A", role: "member", joinedDate: "Jan 12, 2026" },
  { id: "3", name: "Priya Singh", email: "priya@email.com", avatar: "P", role: "member", joinedDate: "Jan 15, 2026" },
  { id: "4", name: "Sneha Gupta", email: "sneha@email.com", avatar: "S", role: "member", joinedDate: "Jan 18, 2026" },
];

export default function RoomSettings() {
  const [copied, setCopied] = useState(false);
  const inviteCode = "PG204XYZ";

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Room Settings</h1>
        <p className="text-muted-foreground">Manage your room and members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Room Info & Invite */}
        <div className="lg:col-span-1 space-y-6">
          {/* Room Info Card */}
          <Card className="p-6 shadow-card animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Room Details</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  defaultValue="Sunrise PG - Room 204"
                  className="h-11"
                />
              </div>

              <Button className="w-full gradient-primary border-0">
                Save Changes
              </Button>
            </div>
          </Card>

          {/* Invite Card */}
          <Card className="p-6 shadow-card animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Invite Members</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Share this code with your roommates to invite them
            </p>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-lg tracking-widest text-center font-semibold">
                {inviteCode}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={copyInviteCode}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 shadow-card border-destructive/20 animate-fade-in">
            <h3 className="font-semibold text-destructive mb-4">Danger Zone</h3>
            <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-2" />
              Leave Room
            </Button>
          </Card>
        </div>

        {/* Right Column - Members List */}
        <div className="lg:col-span-2">
          <Card className="p-6 shadow-card animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Room Members</h3>
                  <p className="text-sm text-muted-foreground">{members.length} members</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{member.name}</span>
                        {member.role === "admin" && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            <Crown className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">Joined {member.joinedDate}</p>
                    </div>
                  </div>

                  {member.role !== "admin" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
