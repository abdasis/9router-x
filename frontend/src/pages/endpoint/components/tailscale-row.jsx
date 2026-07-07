import PropTypes from "prop-types";
import { ExternalLink, Power, LoaderCircle, AlertCircle, Check, Copy } from "lucide-react";
import { Input, Button } from "@/shared/components";

export default function TailscaleRow({ tsState, copied, copy, onOpen, onDisable }) {
  const {
    tsEnabled, tsLoading, tsReachable, tsConnecting,
    tsProgress, tsStatus, tsUrl, tsEverReachable,
    tsAuthUrl, tsAuthLabel,
    setTsLoading, setTsConnecting, setTsProgress, clearUserAuth,
  } = tsState;

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-mono px-1.5 py-0.5 rounded shrink-0 min-w-[88px] text-center ${
        tsEnabled ? "bg-primary/10 text-primary" : "bg-surface-2 text-text-muted"
      }`}>Tailscale</span>
      {tsEnabled && !tsLoading && tsReachable ? (
        <>
          <Input value={`${tsUrl}/v1`} readOnly className="flex-1 font-mono text-sm" />
          <button
            onClick={() => copy(`${tsUrl}/v1`, "ts_url")}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded text-text-muted hover:text-primary transition-colors shrink-0"
          >
            {copied === "ts_url" ? <Check size={18} /> : <Copy size={18} />}
          </button>
          <button
            onClick={onDisable}
            className="p-2 hover:bg-red-500/10 rounded text-red-500 transition-colors shrink-0"
            title="Disable Tailscale"
          >
            <Power size={18} />
          </button>
        </>
      ) : tsEnabled && !tsLoading && !tsReachable ? (
        <>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded border border-amber-300 dark:border-amber-800 bg-amber-500/5 text-sm text-amber-600 dark:text-amber-400">
            <LoaderCircle size={16} className="animate-spin" />
            {tsEverReachable ? "Tailscale reconnecting..." : "Tailscale checking..."}
          </div>
          <button
            onClick={onDisable}
            className="p-2 hover:bg-red-500/10 rounded text-red-500 transition-colors shrink-0"
            title="Disable Tailscale"
          >
            <Power size={18} />
          </button>
        </>
      ) : (tsLoading || tsConnecting) ? (
        <>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-input text-sm text-text-muted">
            <LoaderCircle size={16} className="animate-spin" />
            {tsProgress || "Connecting..."}
          </div>
          {tsAuthUrl && (
            <Button
              size="sm"
              onClick={() => window.open(tsAuthUrl, "tailscale_auth", "width=600,height=700,noopener,noreferrer")}
            >
              <ExternalLink size={16} />
              {tsAuthLabel || "Open"}
            </Button>
          )}
          <button
            onClick={() => { setTsLoading(false); setTsConnecting(false); setTsProgress(""); clearUserAuth(); }}
            className="p-2 hover:bg-red-500/10 rounded text-red-500 transition-colors shrink-0"
            title="Stop"
          >
            <Power size={18} />
          </button>
        </>
      ) : tsStatus?.type === "error" ? (
        <>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded border border-red-300 dark:border-red-800 bg-red-500/5 text-sm text-red-600 dark:text-red-400">
            <AlertCircle size={16} />
            {tsStatus.message}
          </div>
          <Button size="sm" onClick={onOpen}><ExternalLink size={16} /> Enable</Button>
        </>
      ) : (
        <Button
          size="sm"
          onClick={onOpen}
          className="bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white!"
        >
          <ExternalLink size={16} /> Enable
        </Button>
      )}
    </div>
  );
}

TailscaleRow.propTypes = {
  tsState: PropTypes.object.isRequired,
  copied: PropTypes.string,
  copy: PropTypes.func,
  onOpen: PropTypes.func,
  onDisable: PropTypes.func,
};
