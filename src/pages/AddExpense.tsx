import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Upload, Receipt, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getRoomsByUser, createExpense, uploadBillImage } from "@/services/api";

const EXPENSE_CATEGORIES = [
  { value: "groceries", label: "Groceries" },
  { value: "dining", label: "Dining" },
  { value: "utilities", label: "Utilities" },
  { value: "others", label: "Others" },
];

export default function AddExpense() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [category, setCategory] = useState("groceries");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [paidBy, setPaidBy] = useState<string>("");
  const [billImageFile, setBillImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Rooms to get members
  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms', user?.id],
    queryFn: () => getRoomsByUser(user!.id),
    enabled: !!user?.id,
  });

  const activeRoom = roomsData?.docs?.[0];
  const members = activeRoom?.members || [];

  // Initialize defaults once room is loaded
  useEffect(() => {
    if (activeRoom && members.length > 0) {
      if (selectedMembers.length === 0) {
        setSelectedMembers(members.map((m: any) => typeof m === 'string' ? m : m.id));
      }
      if (!paidBy && user) {
        setPaidBy(user.id);
      }
    }
  }, [activeRoom, members, user, selectedMembers.length, paidBy]);

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBillImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !description || !activeRoom) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member to split with");
      return;
    }

    setSubmitting(true);
    try {
      let billImageId = undefined;

      // Upload image if selected
      if (billImageFile) {
        const uploadRes = await uploadBillImage(billImageFile);
        billImageId = uploadRes.id;
      }

      await createExpense({
        amount: parseFloat(amount),
        description,
        date: date.toISOString(),
        paidBy: paidBy,
        membersPresent: selectedMembers,
        room: activeRoom.id,
        category,
        billImage: billImageId,
      });

      toast.success("Expense added successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Add expense error:", error);
      toast.error("Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  if (roomsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activeRoom) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please join or create a room first.</p>
          <Button onClick={() => navigate('/room-setup')} className="mt-4">
            Setup Room
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Add Expense</h1>
          <p className="text-muted-foreground">{activeRoom.name}</p>
        </div>

        <Card className="p-6 shadow-card animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-8 h-12 text-lg"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-11 justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Paid By */}
            <div className="space-y-2">
              <Label>Paid By</Label>
              <Select value={paidBy} onValueChange={setPaidBy}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select who paid" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member: any) => {
                    const mId = typeof member === 'string' ? member : member.id;
                    const mName = typeof member === 'object' ? member.name : 'Unknown';
                    return (
                      <SelectItem key={mId} value={mId}>
                        {mName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Members Present */}
            <div className="space-y-3">
              <Label>Members Present</Label>
              <div className="grid grid-cols-2 gap-3">
                {members.map((member: any) => {
                  const mId = typeof member === 'string' ? member : member.id;
                  const mName = typeof member === 'object' ? member.name : 'Unknown';
                  const mAvatar = typeof member === 'object' && member.avatar ? member.avatar : mName.charAt(0);

                  return (
                    <label
                      key={mId}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        selectedMembers.includes(mId)
                          ? "border-primary bg-accent"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Checkbox
                        checked={selectedMembers.includes(mId)}
                        onCheckedChange={() => toggleMember(mId)}
                      />
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                          {mAvatar && mAvatar.toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{mName}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Description/Notes */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="e.g., Weekly groceries from Reliance"
                className="min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Bill Upload */}
            <div className="space-y-2">
              <Label>Bill Image (Optional)</Label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Bill"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBillImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click to upload bill image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full h-12 gradient-primary border-0" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4 mr-2" />
                  Add Expense
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
