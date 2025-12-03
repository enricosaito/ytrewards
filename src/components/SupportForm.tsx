import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface SupportFormProps {
  userEmail?: string;
}

export const SupportForm = ({ userEmail }: SupportFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: userEmail || "",
    subject: "",
    category: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build the subject with category
      const fullSubject = formData.category 
        ? `[${formData.category}] ${formData.subject}`
        : formData.subject;

      // Call the Resend API endpoint
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: fullSubject,
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      toast.success("Support request submitted successfully!", {
        description: "We'll get back to you as soon as possible.",
      });

      // Reset form
      setFormData({
        name: "",
        email: userEmail || "",
        subject: "",
        category: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Error submitting request", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input
          type="text"
          placeholder="Your name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input
          type="email"
          placeholder="Your email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Account">Account Issues</SelectItem>
            <SelectItem value="Payment">Payment & Withdrawals</SelectItem>
            <SelectItem value="Technical">Technical Problems</SelectItem>
            <SelectItem value="Videos">Video Reviews</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Subject</label>
        <Input
          type="text"
          placeholder="Brief description of your issue"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Message</label>
        <Textarea
          placeholder="Describe your issue in detail..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          rows={5}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
};
