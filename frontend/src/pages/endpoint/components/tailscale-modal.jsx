import PropTypes from "prop-types";
import { LoaderCircle, CheckCircle } from "lucide-react";
import { Modal, Button } from "@/shared/components";
import StatusAlert from "@/pages/endpoint/components/status-alert";

export default function TailscaleModal({
  isOpen,
  onClose,
  tsInstalled,
  tsInstalling,
  tsInstallLog,
  tsLogRef,
  tsStatus,
  onInstall,
  onConnect,
}) {
  return (
    <Modal isOpen={isOpen} title="Tailscale Funnel" onClose={() => { if (!tsInstalling) onClose(); }}>
      <div className="flex flex-col gap-4">
        {tsInstalled === null && (
          <p className="text-sm text-text-muted flex items-center gap-2">
            <LoaderCircle size={16} className="animate-spin" />
            Checking...
          </p>
        )}

        {tsInstalled === false && !tsInstalling && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-text-muted">Tailscale is not installed. Install it to enable Funnel.</p>
            <div className="flex gap-2">
              <Button onClick={onInstall} fullWidth>
                Install Tailscale
              </Button>
              <Button onClick={onClose} variant="ghost" fullWidth>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {tsInstalling && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-text-muted">
  <LoaderCircle size={16} className="animate-spin" />
              Installing Tailscale...
            </div>
            {tsInstallLog.length > 0 && (
              <div ref={tsLogRef} className="bg-black/5 dark:bg-white/5 rounded p-2 max-h-40 overflow-y-auto font-mono text-xs text-text-muted">
                {tsInstallLog.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {tsInstalled === true && !tsInstalling && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle size={16} />
              Tailscale installed
            </div>
            <div className="flex gap-2">
              <Button onClick={onConnect} fullWidth>
                Connect
              </Button>
              <Button onClick={onClose} variant="ghost" fullWidth>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {tsStatus && <StatusAlert status={tsStatus} />}
      </div>
    </Modal>
  );
}

TailscaleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tsInstalled: PropTypes.bool,
  tsInstalling: PropTypes.bool,
  tsInstallLog: PropTypes.array,
  tsLogRef: PropTypes.object,
  tsStatus: PropTypes.object,
  onInstall: PropTypes.func.isRequired,
  onConnect: PropTypes.func.isRequired,
};
