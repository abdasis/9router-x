import PropTypes from "prop-types";
import { Modal, Button } from "@/shared/components";

export default function DisableTunnelModal({ isOpen, onClose, onConfirm, loading }) {
  return (
    <Modal isOpen={isOpen} title="Disable Tunnel" onClose={() => !loading && onClose()}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">The Cloudflare tunnel will be disconnected. Remote access via tunnel URL will stop working.</p>
        <div className="flex gap-2">
          <Button onClick={onConfirm} fullWidth disabled={loading} variant="danger">
            {loading ? "Disabling..." : "Disable"}
          </Button>
          <Button onClick={onClose} variant="ghost" fullWidth disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

DisableTunnelModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
