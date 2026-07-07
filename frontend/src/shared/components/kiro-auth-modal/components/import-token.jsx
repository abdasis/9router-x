import { CheckCircle, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ImportToken({
  refreshToken,
  onRefreshTokenChange,
  onImport,
  onBack,
  importing,
  autoDetecting,
  autoDetected,
  error,
}) {
  if (autoDetecting) {
    return (
      <div className="text-center py-6">
        <div className="size-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="size-8 text-primary animate-spin" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Auto-detecting token...</h3>
        <p className="text-sm text-muted-foreground">
          Reading from AWS SSO cache
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {autoDetected && (
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex gap-2">
            <CheckCircle className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 dark:text-green-200">
              Token auto-detected from Kiro IDE successfully!
            </p>
          </div>
        </div>
      )}

      {!autoDetected && !error && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex gap-2">
            <Info className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Kiro IDE not detected. Please paste your refresh token manually.
            </p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          Refresh Token <span className="text-red-500">*</span>
        </label>
        <Input
          value={refreshToken}
          onChange={(e) => onRefreshTokenChange(e.target.value)}
          placeholder="Token will be auto-filled..."
          className="font-mono text-sm"
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}


<div className="flex gap-2">
        <Button
          onClick={onImport}
          className="w-full"
          disabled={importing || !refreshToken.trim()}
        >
          {importing ? "Importing..." : "Import Token"}
        </Button>
        <Button onClick={onBack} variant="ghost" className="w-full">
          Back
        </Button>
      </div>
    </div>
  );
}
