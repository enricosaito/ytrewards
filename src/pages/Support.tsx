import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Mail, MessageCircle } from "lucide-react";
import { SupportForm } from "@/components/SupportForm";

const Support = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Support</h1>
            <p className="text-muted-foreground">
              We're here to help you
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Form */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Contact Us</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
            <SupportForm userEmail={userEmail} />
          </Card>

          {/* FAQ / Quick Help */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Quick Help</h2>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-secondary rounded-lg">
                  <h3 className="font-medium">How do I earn money?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Watch and review 5 videos daily to earn $25.00. Earnings are credited after completing the entire daily list.
                  </p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <h3 className="font-medium">When can I withdraw?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Withdrawals are available once you reach your withdrawal goal shown on the dashboard.
                  </p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <h3 className="font-medium">Why isn't my progress saving?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Make sure you have a stable internet connection and complete each video review fully before moving on.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Email Support</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                For urgent matters, you can reach us directly at:
              </p>
              <a
                href="mailto:support@ytrewards.com"
                className="text-primary hover:underline font-medium"
              >
                support@ytrewards.com
              </a>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
