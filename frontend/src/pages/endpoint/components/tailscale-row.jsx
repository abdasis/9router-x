import PropTypes from "prop-types";
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
            <span className="material-symbols-outlined text-[18px]">{copied === "ts_url" ? "check" : "content_copy"}</span>
          </button>
          <button
            onClick={onDisable}
            className="p-2 hover:bg-red-500/10 rounded text-red-500 transition-colors shrink-0"
            title="Disable Tailscale"
          >
            <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
          </button>
        </>
      ) : tsEnabled && !tsLoading && !tsReachable ? (
        <>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded border border-amber-300 dark:border-amber-800 bg-amber-500/5 text-sm text-amber-600 dark:text-amber-400">
            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            {tsEverReachable ? "Tailscale reconnecting..." : "Tailscale checking..."}
          </div>
          <button
            onClick={onDisable}
            className="p-2 hover:bg-red-500/10 rounded text-red-500 transition-colors shrink-0"
            title="Disable Tailscale"
          >
            <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
          </button>
        </>
      ) : (tsLoading || tsConnecting) ? (
        <>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-input text-sm text-text-muted">
            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            {tsProgress || "Connecting..."}
          </div>
          {tsAuthUrl && (
            <Button
              size="sm"
              icon="open_in_new"
              onClick={() => window.open(tsAuthUrl, "tailscale_auth", "width=600,height=700,noopener,noreferrer")}
            >
              {tsAuthLabel || "Open"}
            </Button>
          )}
          <button
            onClick={() => { setTsLoading(false); setTsConnecting(false); setTsProgress(""); clearUserAuth(); }}
            className="p-2 hover:bg-red-500/10 rounded text-red-500 transition-colors shrink-0"
            title="Stop"
          >
            <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
          </button>
        </>
      ) : tsStatus?.type === "error" ? (
        <>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded border border-red-300 dark:border-red-800 bg-red-500/5 text-sm text-red-600 dark:text-red-400">
            <span className="material-symbols-outlined text-sm">error</span>
            {tsStatus.message}
          </div>
          <Button size="sm" icon="vpn_lock" onClick={onOpen}>Enable</Button>
        </>
      ) : (
        <Button
          size="sm"
          icon="vpn_lock"
          onClick={onOpen}
          className="bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white!"
        >
          Enable
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
