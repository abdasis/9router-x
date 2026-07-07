import { Shield, Building2, CircleUser, Code, FileUp } from "lucide-react";

export default function MethodList({ onSelect }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        Choose your authentication method:
      </p>

      <button
        onClick={() => onSelect("builder-id")}
        className="w-full p-4 text-left border border-border rounded-lg hover:bg-muted transition-colors"
      >
        <div className="flex items-start gap-3">
          <Shield className="size-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">AWS Builder ID</h3>
            <p className="text-sm text-muted-foreground">
              Recommended for most users. Free AWS account required.
            </p>
          </div>
        </div>
      </button>

      <button
        onClick={() => onSelect("idc")}
        className="w-full p-4 text-left border border-border rounded-lg hover:bg-muted transition-colors"
      >
        <div className="flex items-start gap-3">
          <Building2 className="size-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">AWS IAM Identity Center</h3>
            <p className="text-sm text-muted-foreground">
              For enterprise users with custom AWS IAM Identity Center.
            </p>
          </div>
        </div>
      </button>

      <button
        onClick={() => onSelect("social-google")}
        className="hidden w-full p-4 text-left border border-border rounded-lg hover:bg-muted transition-colors"
      >
        <div className="flex items-start gap-3">
          <CircleUser className="size-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Google Account</h3>
            <p className="text-sm text-muted-foreground">
              Login with your Google account (manual callback).
            </p>
          </div>
        </div>
      </button>

      <button
        onClick={() => onSelect("social-github")}
        className="hidden w-full p-4 text-left border border-border rounded-lg hover:bg-muted transition-colors"
      >
        <div className="flex items-start gap-3">
          <Code className="size-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">GitHub Account</h3>
            <p className="text-sm text-muted-foreground">
              Login with your GitHub account (manual callback).
            </p>
          </div>
        </div>
      </button>

      <button
        onClick={() => onSelect("import")}
        className="w-full p-4 text-left border border-border rounded-lg hover:bg-muted transition-colors"
      >
        <div className="flex items-start gap-3">
          <FileUp className="size-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Import Token</h3>
            <p className="text-sm text-muted-foreground">
              Paste refresh token from Kiro IDE.
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
