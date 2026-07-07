import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SocialLogin({ provider, onLogin, onBack }) {
  const providerName = provider === "google" ? "Google" : "GitHub";

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex gap-2">
          <Info className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
              Manual Callback Required
            </p>
            <p className="text-amber-800 dark:text-amber-200">
              After login, you&apos;ll need to copy the callback URL from your browser and paste it back here.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onLogin(provider)} className="w-full">
          Continue with {providerName}
        </Button>
        <Button onClick={onBack} variant="ghost" className="w-full">
          Back
        </Button>
      </div>
    </div>
  );
}
