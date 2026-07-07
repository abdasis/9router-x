import PropTypes from "prop-types";
import { Modal, Button } from "@/shared/components";

export default function DisableTailscaleModal({ isOpen, onClose, onConfirm, loading }) {
  return (
    <Modal isOpen={isOpen} title="Disable Tailscale" onClose={() => !loading && onClose()}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">Tailscale Funnel will be stopped. Remote access via Tailscale URL will stop working.</p>
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

DisableTailscaleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
