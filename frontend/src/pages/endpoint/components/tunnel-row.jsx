import PropTypes from "prop-types";
import { Input, Button } from "@/shared/components";

export default function TunnelRow({ tunnelState, copied, copy, onEnable, onDisable }) {
  const {
    tunnelEnabled, tunnelLoading, tunnelReachable,
    tunnelProgress, tunnelStatus, tunnelChecking,
    tunnelUrl, tunnelPublicUrl, tunnelEverReachable,
    setTunnelLoading, setTunnelProgress, setTunnelChecking,
  } = tunnelState;

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-mono px-1.5 py-0.5 rounded shrink-0 min-w-[88px] text-center ${
        tunnelEnabled ? "bg-primary/10 text-primary" : "bg-surface-2 text-text-muted"
      }`}>Tunnel</span>
      {tunnelEnabled && !tunnelLoading && tunnelReachable ? (
        <>
          <Input value={`${tunnelPublicUrl || tunnelUrl}/v1`} readOnly className="flex-1 font-mono text-sm" />
          <button
            onClick={() => copy(`${tunnelPublicUrl || tunnelUrl}/v1`, "tunnel_url")}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded text-text-muted hover:text-primary transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">{copied === "tunnel_url" ? "check" : "content_copy"}</span>
          </button>
          <button
            onClick={onDisable}
            className="p-2 hover:bg-red-500/10 rounded text-red-500 transition-colors shrink-0"
            title="Disable Tunnel"
          >
            <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
          </button>
        </>
      ) : tunnelEnabled && !tunnelLoading && !tunnelReachable ? (
        <>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded border border-amber-300 dark:border-amber-800 bg-amber-500/5 text-sm text-amber-600 dark:text-amber-400">
            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            {tunnelEverReachable ? "Tunnel reconnecting..." : "Tunnel checking..."}
          </div>
          <button
            onClick={onDisable}
            className="p-2 hover:bg-red-500/10 rounded text-red-500 transition-colors shrink-0"
            title="Disable Tunnel"
          >
            <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
          </button>
        </>
      ) : tunnelLoading ? (
        <>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-input text-sm text-text-muted">
            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            {tunnelProgress || "Creating tunnel..."}
          </div>
          <button
            onClick={() => { setTunnelLoading(false); setTunnelProgress(""); }}
            className="p-2 hover:bg-red-500/10 rounded text-red-500 transition-colors shrink-0"
            title="Stop"
          >
            <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
          </button>
        </>
      ) : tunnelStatus?.type === "error" ? (
        <>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded border border-red-300 dark:border-red-800 bg-red-500/5 text-sm text-red-600 dark:text-red-400">
            <span className="material-symbols-outlined text-sm">error</span>
            {tunnelStatus.message}
          </div>
          <Button size="sm" icon="cloud_upload" onClick={onEnable}>Enable</Button>
        </>
      ) : tunnelChecking ? (
        <>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-input text-sm text-text-muted">
            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            Checking...
          </div>
          <button
            onClick={() => setTunnelChecking(false)}
            className="p-2 hover:bg-red-500/10 rounded text-red-500 transition-colors shrink-0"
            title="Stop"
          >
            <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
          </button>
        </>
      ) : (
        <Button size="sm" icon="cloud_upload" onClick={onEnable}>
          Enable
        </Button>
      )}
    </div>
  );
}

TunnelRow.propTypes = {
  tunnelState: PropTypes.object.isRequired,
  copied: PropTypes.string,
  copy: PropTypes.func,
  onEnable: PropTypes.func,
  onDisable: PropTypes.func,
};
