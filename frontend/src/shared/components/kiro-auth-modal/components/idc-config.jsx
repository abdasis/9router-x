import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function IdcConfig({ startUrl, region, onStartUrlChange, onRegionChange, error, onContinue, onBack }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          IDC Start URL <span className="text-red-500">*</span>
        </label>
        <Input
          value={startUrl}
          onChange={(e) => onStartUrlChange(e.target.value)}
          placeholder="https://your-org.awsapps.com/start"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Your organization&apos;s AWS IAM Identity Center URL
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          AWS Region
        </label>
        <Input
          value={region}
          onChange={(e) => onRegionChange(e.target.value)}
          placeholder="us-east-1"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          AWS region for your Identity Center (default: us-east-1)
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-2">
        <Button onClick={onContinue} className="w-full">
          Continue
        </Button>
        <Button onClick={onBack} variant="ghost" className="w-full">
          Back
        </Button>
      </div>
    </div>
  );
}
