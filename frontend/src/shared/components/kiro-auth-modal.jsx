import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MethodList from "./kiro-auth-modal/components/method-list";
import IdcConfig from "./kiro-auth-modal/components/idc-config";
import SocialLogin from "./kiro-auth-modal/components/social-login";
import ImportToken from "./kiro-auth-modal/components/import-token";

export default function KiroAuthModal({ isOpen, onMethodSelect, onClose }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [idcStartUrl, setIdcStartUrl] = useState("");
  const [idcRegion, setIdcRegion] = useState("us-east-1");
  const [refreshToken, setRefreshToken] = useState("");
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);

  useEffect(() => {
    if (selectedMethod !== "import" || !isOpen) return;

    const autoDetect = async () => {
      setAutoDetecting(true);
      setError(null);
      setAutoDetected(false);

      try {
        const res = await fetch("/api/oauth/kiro/auto-import");
        const data = await res.json();

        if (data.found) {
          setRefreshToken(data.refreshToken);
          setAutoDetected(true);
        } else {
          setError(data.error || "Could not auto-detect token");
        }
      } catch {
        setError("Failed to auto-detect token");
      } finally {
        setAutoDetecting(false);
      }
    };

    autoDetect();
  }, [selectedMethod, isOpen]);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setError(null);
  };

  const handleBack = () => {
    setSelectedMethod(null);
    setError(null);
  };

  const handleImportToken = async () => {
    if (!refreshToken.trim()) {
      setError("Please enter a refresh token");
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const res = await fetch("/api/oauth/kiro/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshToken.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      onMethodSelect("import");
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleIdcContinue = () => {
    if (!idcStartUrl.trim()) {
      setError("Please enter your IDC start URL");
      return;
    }
    onMethodSelect("idc", { startUrl: idcStartUrl.trim(), region: idcRegion });
  };

  const handleSocialLogin = (provider) => {
    onMethodSelect("social", { provider });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>Connect Kiro</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-5 max-h-[calc(85vh-100px)] overflow-y-auto">
          {!selectedMethod && (
            <MethodList onSelect={handleMethodSelect} />
          )}

          {selectedMethod === "idc" && (
            <IdcConfig
              startUrl={idcStartUrl}
              region={idcRegion}
              onStartUrlChange={setIdcStartUrl}
              onRegionChange={setIdcRegion}
              error={error}
              onContinue={handleIdcContinue}
              onBack={handleBack}
            />
          )}

          {selectedMethod === "social-google" && (
            <SocialLogin provider="google" onLogin={handleSocialLogin} onBack={handleBack} />
          )}

          {selectedMethod === "social-github" && (
            <SocialLogin provider="github" onLogin={handleSocialLogin} onBack={handleBack} />
          )}

          {selectedMethod === "import" && (
            <ImportToken
              refreshToken={refreshToken}
              onRefreshTokenChange={setRefreshToken}
              onImport={handleImportToken}
              onBack={handleBack}
              importing={importing}
              autoDetecting={autoDetecting}
              autoDetected={autoDetected}
              error={error}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

KiroAuthModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onMethodSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
