import { useState, useRef } from "react";
import { clientPingAny } from "@/pages/endpoint/utils/endpoint";
import {
  TUNNEL_PING_INTERVAL_MS,
  TUNNEL_PING_MAX_MS,
  REACHABLE_MISS_THRESHOLD,
  CLIENT_PING_FAST_MS,
} from "@/pages/endpoint/constants/endpoint";

export function useTunnelState() {
  const [tunnelChecking, setTunnelChecking] = useState(true);
  const [tunnelEnabled, setTunnelEnabled] = useState(false);
  const [tunnelReachable, setTunnelReachable] = useState(false);
  const [tunnelUrl, setTunnelUrl] = useState("");
  const [tunnelPublicUrl, setTunnelPublicUrl] = useState("");
  const [tunnelLoading, setTunnelLoading] = useState(false);
  const [tunnelProgress, setTunnelProgress] = useState("");
  const [tunnelStatus, setTunnelStatus] = useState(null);
  const [showEnableTunnelModal, setShowEnableTunnelModal] = useState(false);
  const [showDisableTunnelModal, setShowDisableTunnelModal] = useState(false);
  const [tunnelEverReachable, setTunnelEverReachable] = useState(false);

  const tunnelMissRef = useRef(0);
  const tunnelClientReachableRef = useRef(false);
  const tunnelEverReachableRef = useRef(false);

  const updateReachable = (clientRef, missRef, setter, everRef, everSetter) => {
    const reachable = clientRef.current;
    if (reachable) {
      missRef.current = 0;
      setter(true);
      if (!everRef.current) {
        everRef.current = true;
        everSetter(true);
      }
    } else {
      missRef.current += 1;
      if (missRef.current >= REACHABLE_MISS_THRESHOLD) setter(false);
    }
  };

  const syncFromStatus = (data) => {
    const tEnabled = data.tunnel?.settingsEnabled ?? data.tunnel?.enabled ?? false;
    const tUrl = data.tunnel?.tunnelUrl || "";
    setTunnelUrl(tUrl);
    setTunnelPublicUrl(data.tunnel?.publicUrl || "");
    setTunnelEnabled(tEnabled);
    updateReachable(tunnelClientReachableRef, tunnelMissRef, setTunnelReachable, tunnelEverReachableRef, setTunnelEverReachable);
  };

  const pingTunnelHealth = async (...urls) => {
    setTunnelLoading(true);
    setTunnelProgress("Waiting for tunnel ready...");
    const targets = urls.filter(Boolean).map((u) => `${u}/api/health`);
    const start = Date.now();
    while (Date.now() - start < TUNNEL_PING_MAX_MS) {
      await new Promise((r) => setTimeout(r, TUNNEL_PING_INTERVAL_MS));
      const ok = await Promise.any(targets.map(async (h) => {
        const p = await fetch(h, { mode: "cors", cache: "no-store" });
        if (p.ok) return true;
        throw new Error("not ready");
      })).catch(() => false);
      if (ok) {
        setTunnelEnabled(true);
        setTunnelLoading(false);
        setTunnelProgress("");
        return true;
      }
      if ((Date.now() - start) % 10000 < TUNNEL_PING_INTERVAL_MS) {
        try {
          const statusRes = await fetch("/api/tunnel/status");
          if (statusRes.ok) {
            const status = await statusRes.json();
            if (!status.tunnel?.enabled) {
              setTunnelStatus({ type: "error", message: "Tunnel process stopped unexpectedly." });
              setTunnelLoading(false);
              setTunnelProgress("");
              return false;
            }
          }
        } catch { /* ignore */ }
      }
    }
    setTunnelStatus({ type: "error", message: "Tunnel created but not reachable. Please try again." });
    setTunnelLoading(false);
    setTunnelProgress("");
    return false;
  };

  const handleEnableTunnel = async () => {
    setShowEnableTunnelModal(false);
    setTunnelLoading(true);
    setTunnelStatus(null);
    setTunnelProgress("Creating tunnel...");

    let polling = true;
    const pollProgress = async () => {
      while (polling) {
        try {
          const r = await fetch("/api/tunnel/status");
          if (r.ok) {
            const s = await r.json();
            if (s.download?.downloading) {
              setTunnelProgress(`Downloading cloudflared... ${s.download.progress}%`);
            } else if (polling) {
              setTunnelProgress("Creating tunnel...");
            }
          }
        } catch { /* ignore */ }
        await new Promise((r) => setTimeout(r, 1000));
      }
    };
    pollProgress();

    try {
      const res = await fetch("/api/tunnel/enable", { method: "POST" });
      polling = false;
      const data = await res.json();
      if (!res.ok) {
        setTunnelStatus({ type: "error", message: data.error || "Failed to enable tunnel" });
        return;
      }
      const url = data.tunnelUrl;
      if (!url) {
        setTunnelStatus({ type: "error", message: "No tunnel URL returned" });
        return;
      }
      setTunnelUrl(url);
      setTunnelPublicUrl(data.publicUrl || "");
      await pingTunnelHealth(data.publicUrl, url);
    } catch (error) {
      setTunnelStatus({ type: "error", message: error.message });
    } finally {
      polling = false;
      setTunnelLoading(false);
      setTunnelProgress("");
    }
  };

  const handleDisableTunnel = async () => {
    setTunnelLoading(true);
    setTunnelStatus(null);
    try {
      const res = await fetch("/api/tunnel/disable", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setTunnelEnabled(false);
        setTunnelUrl("");
        setShowDisableTunnelModal(false);
        setTunnelStatus({ type: "success", message: "Tunnel disabled" });
      } else {
        setTunnelStatus({ type: "error", message: data.error || "Failed to disable tunnel" });
      }
    } catch (error) {
      setTunnelStatus({ type: "error", message: error.message });
    } finally {
      setTunnelLoading(false);
    }
  };

  const pingInterval = async () => {
    if (tunnelEnabled && (tunnelUrl || tunnelPublicUrl)) {
      const ok = await clientPingAny(tunnelPublicUrl, tunnelUrl);
      tunnelClientReachableRef.current = ok;
      if (ok) {
        tunnelMissRef.current = 0;
        setTunnelReachable(true);
        if (!tunnelEverReachableRef.current) {
          tunnelEverReachableRef.current = true;
          setTunnelEverReachable(true);
        }
      } else {
        tunnelMissRef.current += 1;
        if (tunnelMissRef.current >= REACHABLE_MISS_THRESHOLD) setTunnelReachable(false);
      }
    } else {
      tunnelClientReachableRef.current = false;
    }
  };

  return {
    tunnelChecking, setTunnelChecking,
    tunnelEnabled, setTunnelEnabled,
    tunnelReachable, setTunnelReachable,
    tunnelUrl, setTunnelUrl,
    tunnelPublicUrl, setTunnelPublicUrl,
    tunnelLoading, setTunnelLoading,
    tunnelProgress, setTunnelProgress,
    tunnelStatus, setTunnelStatus,
    showEnableTunnelModal, setShowEnableTunnelModal,
    showDisableTunnelModal, setShowDisableTunnelModal,
    tunnelEverReachable, setTunnelEverReachable,
    tunnelClientReachableRef,
    tunnelMissRef,
    tunnelEverReachableRef,
    syncFromStatus,
    pingTunnelHealth,
    handleEnableTunnel,
    handleDisableTunnel,
    pingInterval,
  };
}
