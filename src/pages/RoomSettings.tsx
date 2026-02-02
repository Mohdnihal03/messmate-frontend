import { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoomsByUser, updateRoom } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function RoomSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [roomName, setRoomName] = useState("");

  // 1. Fetch Room Data
  const { data: roomsData } = useQuery({
    queryKey: ['rooms', user?.id],
    queryFn: () => getRoomsByUser(user!.id),
    enabled: !!user?.id,
  });
  const activeRoom = roomsData?.docs?.[0];

  useEffect(() => {
    if (activeRoom?.name) {
      setRoomName(activeRoom.name);
    }
  }, [activeRoom]);

  // 2. Mutations
  const updateRoomMutation = useMutation({
    mutationFn: (updates: { name?: string; members?: string[]; admin?: string }) =>
      updateRoom(activeRoom.id, updates),
    onSuccess: () => {
      toast.success("Room updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update room")
  });

  const leaveRoomMutation = useMutation({
    mutationFn: async () => {
      const currentMembers = activeRoom.members.map((m: any) => m.id || m);
      const newMembers = currentMembers.filter((id: string) => id !== user!.id);
      return updateRoom(activeRoom.id, { members: newMembers });
    },
    onSuccess: () => {
      toast.success("Left room successfully");
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      navigate("/room-setup");
    },
    onError: (err: any) => toast.error("Failed to leave room")
  });

  const handleSaveName = () => {
    if (!roomName.trim()) return;
    updateRoomMutation.mutate({ name: roomName });
  };

  const handleLeaveRoom = () => {
    if (window.confirm("Are you sure you want to leave this room?")) {
      leaveRoomMutation.mutate();
    }
  };

  const handleMakeAdmin = (memberId: string) => {
    if (window.confirm("Are you sure you want to transfer admin rights to this member? You will lose admin access.")) {
      updateRoomMutation.mutate({ admin: memberId });
    }
  };

  const copyInviteCode = () => {
    if (!activeRoom?.inviteCode) return;
    navigator.clipboard.writeText(activeRoom.inviteCode);
    setCopied(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeRoom) return (
    <DashboardLayout>Loading...</DashboardLayout>
  );

  const members = activeRoom.members || [];
  const inviteCode = activeRoom.inviteCode;
  const isAdmin = (activeRoom.admin?.id || activeRoom.admin) === user?.id;

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
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="h-11"
                  disabled={!isAdmin}
                />
              </div>

              {isAdmin && (
                <Button
                  className="w-full gradient-primary border-0"
                  onClick={handleSaveName}
                  disabled={updateRoomMutation.isPending}
                >
                  {updateRoomMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              )}
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
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={handleLeaveRoom}
              disabled={leaveRoomMutation.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {leaveRoomMutation.isPending ? "Leaving..." : "Leave Room"}
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
              {members.map((member: any) => {
                const mRole = (activeRoom.admin?.id || activeRoom.admin) === (member.id || member) ? "admin" : "member";
                return (
                  <div
                    key={member.id || member}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {member.avatar || (member.name?.[0] || "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{member.name || "Unknown"}</span>
                          {mRole === "admin" && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              <Crown className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email || ""}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined {member.createdAt ? format(new Date(member.createdAt), "MMM d, yyyy") : "-"}
                        </p>
                      </div>
                    </div>

                    {isAdmin && mRole !== "admin" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-4"
                        onClick={() => handleMakeAdmin(member.id || member)}
                      >
                        Make Admin
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
