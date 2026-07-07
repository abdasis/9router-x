import PropTypes from "prop-types";
import { Cloud, Power, LoaderCircle, AlertCircle, Check, Copy } from "lucide-react";
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
            {copied === "tunnel_url" ? <Check size={18} /> : <Copy size={18} />}
          </button>
          <button
            onClick={onDisable}
            className="p-2 hover:bg-red-500/10 rounded text-red-500 transition-colors shrink-0"
            title="Disable Tunnel"
          >
            <Power size={18} />
          </button>
        </>
      ) : tunnelEnabled && !tunnelLoading && !tunnelReachable ? (
        <>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded border border-amber-300 dark:border-amber-800 bg-amber-500/5 text-sm text-amber-600 dark:text-amber-400">
            <LoaderCircle size={16} className="animate-spin" />
            {tunnelEverReachable ? "Tunnel reconnecting..." : "Tunnel checking..."}
          </div>
          <button
            onClick={onDisable}
            className="p-2 hover:bg-red-500/10 rounded text-red-500 transition-colors shrink-0"
            title="Disable Tunnel"
          >
            <Power size={18} />
          </button>
        </>
      ) : tunnelLoading ? (
        <>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-input text-sm text-text-muted">
<LoaderCircle size={16} className="animate-spin" />
            {tunnelProgress || "Creating tunnel..."}
          </div>
          <button
            onClick={() => { setTunnelLoading(false); setTunnelProgress(""); }}
            className="p-2 hover:bg-red-500/10 rounded text-red-500 transition-colors shrink-0"
            title="Stop"
          >
            <Power size={18} />
          </button>
        </>
      ) : tunnelStatus?.type === "error" ? (
        <>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded border border-red-300 dark:border-red-800 bg-red-500/5 text-sm text-red-600 dark:text-red-400">
<AlertCircle size={16} />
            {tunnelStatus.message}
          </div>
          <Button size="sm" onClick={onEnable}><Cloud size={16} /> Enable</Button>
        </>
      ) : tunnelChecking ? (
        <>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-input text-sm text-text-muted">
<LoaderCircle size={16} className="animate-spin" />
            Checking...
          </div>
          <button
            onClick={() => setTunnelChecking(false)}
            className="p-2 hover:bg-red-500/10 rounded text-red-500 transition-colors shrink-0"
            title="Stop"
          >
            <Power size={18} />
          </button>
        </>
      ) : (
        <Button size="sm" onClick={onEnable}><Cloud size={16} /> Enable</Button>
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
