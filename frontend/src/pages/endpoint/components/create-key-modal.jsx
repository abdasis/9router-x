import PropTypes from "prop-types";
import { Modal, Input, Button } from "@/shared/components";

export default function CreateKeyModal({ isOpen, onClose, value, onChange, onCreate }) {
  return (
    <Modal isOpen={isOpen} title="Create API Key" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input
          label="Key Name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Production Key"
        />
        <div className="flex gap-2">
          <Button onClick={onCreate} fullWidth disabled={!value.trim()}>
            Create
          </Button>
          <Button onClick={onClose} variant="ghost" fullWidth>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

CreateKeyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};
