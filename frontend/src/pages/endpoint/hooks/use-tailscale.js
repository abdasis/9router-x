import { useState, useRef } from "react";
import useTailscaleInstall from "@/pages/endpoint/hooks/use-tailscale-install";
import {
  TUNNEL_PING_INTERVAL_MS,
  TUNNEL_PING_MAX_MS,
  REACHABLE_MISS_THRESHOLD,
} from "@/pages/endpoint/constants/endpoint";

export function useTailscaleState() {
  const [tsEnabled, setTsEnabled] = useState(false);
  const [tsReachable, setTsReachable] = useState(false);
  const [tsUrl, setTsUrl] = useState("");
  const [tsLoading, setTsLoading] = useState(false);
  const [tsProgress, setTsProgress] = useState("");
  const [tsStatus, setTsStatus] = useState(null);
  const [tsAuthUrl, setTsAuthUrl] = useState("");
  const [tsAuthLabel, setTsAuthLabel] = useState("");
  const [tsConnecting, setTsConnecting] = useState(false);
  const [showTsModal, setShowTsModal] = useState(false);
  const [showDisableTsModal, setShowDisableTsModal] = useState(false);
  const [tsEverReachable, setTsEverReachable] = useState(false);

  const installHook = useTailscaleInstall();
  const tsMissRef = useRef(0);
  const tsClientReachableRef = useRef(false);
  const tsEverReachableRef = useRef(false);

  const syncFromStatus = (data) => {
    const tsEn = data.tailscale?.settingsEnabled ?? data.tailscale?.enabled ?? false;
    const tsUrlVal = data.tailscale?.tunnelUrl || "";
    setTsUrl(tsUrlVal);
    setTsEnabled(tsEn);
  };

  const clientPingUrl = async (url) => {
    if (!url) return false;
    try {
      const res = await fetch(`${url}/api/health`, {
        mode: "cors",
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const pingInterval = async () => {
    if (tsEnabled && tsUrl) {
      const ok = await clientPingUrl(tsUrl);
      tsClientReachableRef.current = ok;
      if (ok) {
        tsMissRef.current = 0;
        setTsReachable(true);
        if (!tsEverReachableRef.current) {
          tsEverReachableRef.current = true;
          setTsEverReachable(true);
        }
      } else {
        tsMissRef.current += 1;
        if (tsMissRef.current >= REACHABLE_MISS_THRESHOLD) setTsReachable(false);
      }
    } else {
      tsClientReachableRef.current = false;
    }
  };

  const pingTsHealth = async (url) => {
    setTsProgress("Waiting for Tailscale ready...");
    const healthUrl = `${url}/api/health`;
    const start = Date.now();
    while (Date.now() - start < TUNNEL_PING_MAX_MS) {
      await new Promise((r) => setTimeout(r, TUNNEL_PING_INTERVAL_MS));
      try {
        const ping = await fetch(healthUrl, { mode: "no-cors", cache: "no-store" });
        if (ping.ok || ping.type === "opaque") return true;
      } catch { /* not ready */ }
    }
    return false;
  };

  const requestUserAuth = (url, label) => {
    setTsAuthUrl(url);
    setTsAuthLabel(label);
  };

  const clearUserAuth = () => {
    setTsAuthUrl("");
    setTsAuthLabel("");
  };

  const pollFunnelEnable = async (enableUrl) => {
    requestUserAuth(enableUrl, "Open Funnel Settings");
    setTsProgress("Click \"Open Funnel Settings\" to enable Funnel...");
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const res = await fetch("/api/tunnel/tailscale-enable", { method: "POST" });
        const data = await res.json();
        if (res.ok && data.success) {
          clearUserAuth();
          setTsUrl(data.tunnelUrl || "");
          const ok3 = await pingTsHealth(data.tunnelUrl);
          setTsEnabled(true);
          setTsStatus(ok3 ? null : { type: "warning", message: "Connected but not reachable yet." });
          return;
        }
        if (data.funnelNotEnabled) continue;
        if (data.error) {
          clearUserAuth();
          setTsStatus({ type: "error", message: data.error });
          return;
        }
      } catch { /* retry */ }
    }
    clearUserAuth();
    setTsStatus({ type: "error", message: "Timed out waiting for Funnel to be enabled." });
  };

  const handleConnectTailscale = async () => {
    setShowTsModal(false);
    setTsConnecting(true);
    setTsLoading(true);
    setTsStatus(null);
    setTsProgress("Connecting...");
    clearUserAuth();
    try {
      const res = await fetch("/api/tunnel/tailscale-enable", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.success) {
        setTsUrl(data.tunnelUrl || "");
        const reachable = await pingTsHealth(data.tunnelUrl);
        setTsEnabled(true);
        setTsStatus(reachable ? null : { type: "warning", message: "Connected but not reachable yet." });
        return;
      }

      if (data.needsLogin && data.authUrl) {
        requestUserAuth(data.authUrl, "Open Login Page");
        setTsProgress("Login required — click \"Open Login Page\" to continue");
        for (let i = 0; i < 40; i++) {
          await new Promise((r) => setTimeout(r, 3000));
          try {
            const r2 = await fetch("/api/tunnel/tailscale-check");
            if (r2.ok) {
              const check = await r2.json();
              if (check.loggedIn) {
                clearUserAuth();
                setTsProgress("Starting funnel...");
                const res2 = await fetch("/api/tunnel/tailscale-enable", { method: "POST" });
                const data2 = await res2.json();
                if (res2.ok && data2.success) {
                  setTsUrl(data2.tunnelUrl || "");
                  const ok2 = await pingTsHealth(data2.tunnelUrl);
                  setTsEnabled(true);
                  setTsStatus(ok2 ? null : { type: "warning", message: "Connected but not reachable yet." });
                } else if (data2.funnelNotEnabled && data2.enableUrl) {
                  await pollFunnelEnable(data2.enableUrl);
                } else {
                  setTsStatus({ type: "error", message: data2.error || "Failed to start funnel" });
                }
                return;
              }
            }
          } catch { /* retry */ }
        }
        clearUserAuth();
        setTsStatus({ type: "error", message: "Login timed out. Please try again." });
        return;
      }

      if (data.funnelNotEnabled && data.enableUrl) {
        await pollFunnelEnable(data.enableUrl);
        return;
      }

      setTsStatus({ type: "error", message: data.error || "Failed to connect" });
    } catch (error) {
      setTsStatus({ type: "error", message: error.message });
    } finally {
      setTsLoading(false);
      setTsConnecting(false);
      setTsProgress("");
      clearUserAuth();
    }
  };

  const handleDisableTailscale = async () => {
    setTsLoading(true);
    setTsStatus(null);
    try {
      const res = await fetch("/api/tunnel/tailscale-disable", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setTsEnabled(false);
        setTsUrl("");
        setShowDisableTsModal(false);
        setTsStatus({ type: "success", message: "Tailscale disabled" });
      } else {
        setTsStatus({ type: "error", message: data.error || "Failed to disable Tailscale" });
      }
    } catch (e) {
      setTsStatus({ type: "error", message: e.message });
    } finally {
      setTsLoading(false);
    }
  };

  const handleOpenTsModal = async () => {
    setTsStatus(null);
    installHook.setTsInstallLog([]);
    const data = await installHook.checkInstalled();
    if (data?.installed && data?.hasCachedPassword) {
      handleConnectTailscale();
    } else {
      setShowTsModal(true);
    }
  };

  return {
    tsEnabled, setTsEnabled,
    tsReachable, setTsReachable,
    tsUrl, setTsUrl,
    tsLoading, setTsLoading,
    tsProgress, setTsProgress,
    tsStatus, setTsStatus,
    tsAuthUrl, setTsAuthUrl,
    tsAuthLabel, setTsAuthLabel,
    tsConnecting, setTsConnecting,
    showTsModal, setShowTsModal,
    showDisableTsModal, setShowDisableTsModal,
    tsEverReachable, setTsEverReachable,
    tsMissRef, tsClientReachableRef, tsEverReachableRef,
    syncFromStatus,
    pingInterval,
    handleConnectTailscale,
    handleDisableTailscale,
    handleOpenTsModal,
    installHook,
  };
}
