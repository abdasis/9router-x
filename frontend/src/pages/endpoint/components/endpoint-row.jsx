import PropTypes from "prop-types";
import { Check, Copy } from "lucide-react";
import { Input } from "@/shared/components";

export default function EndpointRow({ label, url, copyId, copied, onCopy, actions }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-mono px-1.5 py-0.5 rounded shrink-0 min-w-[88px] text-center ${
        (label === "CF" || label === "TS") ? "bg-primary/10 text-primary" : "bg-surface-2 text-text-muted"
      }`}>{label}</span>
      <Input value={url} readOnly className="flex-1 font-mono text-sm" />
      <button
        onClick={() => onCopy(url, copyId)}
        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded text-text-muted hover:text-primary transition-colors shrink-0"
      >
                {copied === copyId ? <Check size={18} /> : <Copy size={18} />}
      </button>
      {actions}
    </div>
  );
}

EndpointRow.propTypes = {
  label: PropTypes.string.isRequired,
  url: PropTypes.string,
  copyId: PropTypes.string,
  copied: PropTypes.string,
  onCopy: PropTypes.func,
  actions: PropTypes.node,
};
