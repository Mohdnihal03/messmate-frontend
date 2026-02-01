import { useState } from "react";
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
import { CalendarIcon, Upload, Receipt, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const members = [
  { id: "1", name: "Rahul", avatar: "R" },
  { id: "2", name: "Amit", avatar: "A" },
  { id: "3", name: "Priya", avatar: "P" },
  { id: "4", name: "Sneha", avatar: "S" },
];

export default function AddExpense() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedMembers, setSelectedMembers] = useState<string[]>(members.map(m => m.id));
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

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
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Expense added successfully!");
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Add Expense</h1>
          <p className="text-muted-foreground">Record a new shared expense</p>
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

            {/* Paid By */}
            <div className="space-y-2">
              <Label>Paid By</Label>
              <Select defaultValue="1">
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select who paid" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Members Present */}
            <div className="space-y-3">
              <Label>Members Present</Label>
              <div className="grid grid-cols-2 gap-3">
                {members.map((member) => (
                  <label
                    key={member.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedMembers.includes(member.id)
                        ? "border-primary bg-accent"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => toggleMember(member.id)}
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                        {member.avatar}
                      </div>
                      <span className="font-medium text-foreground">{member.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="e.g., Weekly groceries, vegetables and fruits"
                className="min-h-[100px]"
              />
            </div>

            {/* Bill Upload */}
            <div className="space-y-2">
              <Label>Bill Image (Optional)</Label>
              {uploadedImage ? (
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Bill"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => setUploadedImage(null)}
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
            <Button type="submit" className="w-full h-12 gradient-primary border-0">
              <Receipt className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
