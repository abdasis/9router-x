import PropTypes from "prop-types";
import { CloudUpload, Globe, Users, Code, Lock } from "lucide-react";
import { Modal, Button } from "@/shared/components";
import { TUNNEL_BENEFITS } from "@/pages/endpoint/constants/endpoint";

const BENEFIT_ICONS = { public: Globe, group: Users, code: Code, lock: Lock };

export default function EnableTunnelModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} title="Enable Tunnel" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="bg-surface-2 border border-border-subtle rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CloudUpload className="text-primary" size={20} />
            <div>
              <p className="text-sm text-text-main font-medium mb-1">Cloudflare Tunnel</p>
              <p className="text-sm text-text-muted">
                Expose your local 9Router to the internet. No port forwarding, no static IP needed. Share endpoint URL with your team or use it in Cursor, Cline, and other AI tools from anywhere.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {TUNNEL_BENEFITS.map((benefit) => (
            <div key={benefit.title} className="flex flex-col items-center text-center p-3 rounded-lg bg-sidebar/50">
              {(() => { const Icon = BENEFIT_ICONS[benefit.icon] || Globe; return <Icon size={20} className="text-primary mb-1" />; })()}
              <p className="text-xs font-semibold">{benefit.title}</p>
              <p className="text-xs text-text-muted">{benefit.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-text-muted">
          Requires outbound port 7844 (TCP/UDP). Connection may take 10-30s.
        </p>

        <div className="flex gap-2">
          <Button onClick={onConfirm} fullWidth>
            Start Tunnel
          </Button>
          <Button onClick={onClose} variant="ghost" fullWidth>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

EnableTunnelModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
