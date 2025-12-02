import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SupportForm from "@/components/SupportForm";

export default function Support() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <SupportForm />

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>
            You can also reach us directly at{" "}
            <a
              href="mailto:support@ytrewards.com"
              className="text-primary hover:underline"
            >
              support@ytrewards.com
            </a>
          </p>
          <p className="mt-2 text-gray-500">We typically respond within 24 hours.</p>
        </div>
      </div>
    </div>
  );
}

