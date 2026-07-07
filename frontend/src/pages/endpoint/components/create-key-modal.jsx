import PropTypes from "prop-types";
import { Modal } from "@/shared/components";
import { Input } from "@/shared/components";
import { Button } from "@/shared/components";

export default function CreateKeyModal({ isOpen, onClose, value, onChange, onCreate }) {
  return (
    <Modal
      isOpen={isOpen}
      title="Create API Key"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button onClick={onCreate} disabled={!value.trim()}>
            Create
          </Button>
        </>
      }
    >
      <Input
        label="Key Name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Production Key"
      />
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
