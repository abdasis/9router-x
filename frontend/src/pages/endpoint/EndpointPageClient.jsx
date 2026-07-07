import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import { getCurrentLocale, onLocaleChange } from "@/i18n/runtime";

import useSettings from "@/pages/endpoint/hooks/use-settings";
import { useTunnelState } from "@/pages/endpoint/hooks/use-tunnel";
import { useTailscaleState } from "@/pages/endpoint/hooks/use-tailscale";
import useApiKeys from "@/pages/endpoint/hooks/use-api-keys";
import { isRemoteHost } from "@/pages/endpoint/utils/endpoint";
import {
  WENYAN_LOCALES,
  CAVEMAN_LEVELS,
  STATUS_POLL_FAST_MS,
  CLIENT_PING_FAST_MS,
} from "@/pages/endpoint/constants/endpoint";

import EndpointCard from "@/pages/endpoint/components/endpoint-card";
import TokenSaverCard from "@/pages/endpoint/components/token-saver-card";
import ApiKeysCard from "@/pages/endpoint/components/api-keys-card";
import CreateKeyModal from "@/pages/endpoint/components/create-key-modal";
import CreatedKeyModal from "@/pages/endpoint/components/created-key-modal";
import EnableTunnelModal from "@/pages/endpoint/components/enable-tunnel-modal";
import DisableTunnelModal from "@/pages/endpoint/components/disable-tunnel-modal";
import TailscaleModal from "@/pages/endpoint/components/tailscale-modal";
import DisableTailscaleModal from "@/pages/endpoint/components/disable-tailscale-modal";

export default function APIPageClient({ machineId }) {
  const { copied, copy } = useCopyToClipboard();

  // Hooks
  const apiKeys = useApiKeys();
  const settings = useSettings();
  const tunnel = useTunnelState();
  const tailscale = useTailscaleState();
  const [baseUrl, setBaseUrl] = useState("/v1");

  // Locale sync
  useEffect(() => {
    settings.setLocale(getCurrentLocale());
    return onLocaleChange(() => settings.setLocale(getCurrentLocale()));
  }, []);

  // Reset wenyan level when leaving Chinese locale
  useEffect(() => {
    const isWenyan = WENYAN_LOCALES.includes(settings.locale);
    const current = CAVEMAN_LEVELS.find((lvl) => lvl.id === settings.cavemanLevel);
    if (current?.wenyan && !isWenyan) {
      settings.setCavemanLevel("ultra");
      settings.patchSetting({ cavemanLevel: "ultra" });
    }
  }, [settings.locale, settings.cavemanLevel]);

  // Hydration fix
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(`${window.location.origin}/v1`);
    }
  }, []);

  // Remote host detection
  const [remoteHost, setRemoteHost] = useState(false);
  useEffect(() => {
    setRemoteHost(isRemoteHost());
  }, []);

  // Initial load: settings + tunnel status + keys
  useEffect(() => {
    const load = async () => {
      try {
        const [settingsRes, statusRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/tunnel/status", { cache: "no-store" }),
        ]);
        if (settingsRes.ok) {
          const d = await settingsRes.json();
          settings.setRequireApiKey(d.requireApiKey || false);
          settings.setRequireLogin(d.requireLogin !== false);
          settings.setHasPassword(d.hasPassword || false);
          settings.setTunnelDashboardAccess(d.tunnelDashboardAccess || false);
          settings.setRtkEnabled(d.rtkEnabled !== false);
          settings.setCavemanEnabled(!!d.cavemanEnabled);
          settings.setCavemanLevel(d.cavemanLevel || "full");
        }
        if (statusRes.ok) {
          const d = await statusRes.json();
          tunnel.syncFromStatus(d);
          tailscale.syncFromStatus(d);
        }
      } catch {
        // ignore
      } finally {
        tunnel.setTunnelChecking(false);
      }
    };
    load();
    apiKeys.fetchData();
  }, []);

  // Status polling while degraded
  useEffect(() => {
    const anyEnabled = tunnel.tunnelEnabled || tailscale.tsEnabled;
    if (!anyEnabled) return;
    const healthy =
      (!tunnel.tunnelEnabled || tunnel.tunnelReachable) &&
      (!tailscale.tsEnabled || tailscale.tsReachable);
    const onVisible = () => {
      if (!document.hidden) syncStatus();
    };
    document.addEventListener("visibilitychange", onVisible);
    if (healthy) return () => document.removeEventListener("visibilitychange", onVisible);
    const timer = setInterval(() => {
      if (!document.hidden) syncStatus();
    }, STATUS_POLL_FAST_MS);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [tunnel.tunnelEnabled, tailscale.tsEnabled, tunnel.tunnelReachable, tailscale.tsReachable]);

  const syncStatus = async () => {
    try {
      const res = await fetch("/api/tunnel/status", { cache: "no-store" });
      if (!res.ok) return;
      const d = await res.json();
      tunnel.syncFromStatus(d);
      tailscale.syncFromStatus(d);
    } catch {
      // ignore
    }
  };

  // Client-side periodic ping for tunnel
  useEffect(() => {
    const probe = async () => {
      if (document.hidden) return;
      await tunnel.pingInterval();
    };
    const anyEnabled = tunnel.tunnelEnabled || tailscale.tsEnabled;
    if (!anyEnabled) return;
    probe();
    const healthy = !tunnel.tunnelEnabled || tunnel.tunnelReachable;
    if (healthy) return;
    const id = setInterval(probe, CLIENT_PING_FAST_MS);
    return () => clearInterval(id);
  }, [tunnel.tunnelEnabled, tunnel.tunnelUrl, tunnel.tunnelPublicUrl, tunnel.tunnelReachable]);

  // Client-side periodic ping for tailscale
  useEffect(() => {
    const probe = async () => {
      if (document.hidden) return;
      await tailscale.pingInterval();
    };
    if (!tailscale.tsEnabled || !tailscale.tsUrl) return;
    probe();
    const healthy = tailscale.tsReachable;
    if (healthy) return;
    const id = setInterval(probe, CLIENT_PING_FAST_MS);
    return () => clearInterval(id);
  }, [tailscale.tsEnabled, tailscale.tsUrl, tailscale.tsReachable]);

  // Auto-scroll install log
  useEffect(() => {
    if (tailscale.installHook.tsLogRef.current)
      tailscale.installHook.tsLogRef.current.scrollTop = tailscale.installHook.tsLogRef.current.scrollHeight;
  }, [tailscale.installHook.tsInstallLog]);

  // Pause confirm with toggle
  const handleToggleKey = (id, checked) => {
    const key = apiKeys.keys.find((k) => k.id === id);
    if (!key) return;
    if (key.isActive && !checked) {
      apiKeys.setConfirmState({
        title: "Pause API Key",
        message: `Pause API key "${key.name}"?\n\nThis key will stop working immediately but can be resumed later.`,
        onConfirm: async () => {
          apiKeys.setConfirmState(null);
          apiKeys.handleToggleKey(id, checked);
        },
      });
    } else {
      apiKeys.handleToggleKey(id, checked);
    }
  };

  const isUnsafe = !settings.requireLogin || !settings.hasPassword;
  const unsafeReason = !settings.requireLogin
    ? "Enable \"Require login\" and set a custom password before activating the tunnel."
    : "Change the default dashboard password before activating the tunnel.";

  return (
    <div className="flex flex-col gap-8">
      <EndpointCard
        currentEndpoint={baseUrl}
        copied={copied}
        copy={copy}
        tunnelState={tunnel}
        tsState={tailscale}
        isLoginUnsafe={isUnsafe}
        unsafeReason={unsafeReason}
        requireApiKey={settings.requireApiKey}
        requireLogin={settings.requireLogin}
        hasPassword={settings.hasPassword}
        tunnelDashboardAccess={settings.tunnelDashboardAccess}
        onTunnelDashboardAccess={settings.handleTunnelDashboardAccess}
        onEnableTunnel={tunnel.handleEnableTunnel}
        onDisableTunnel={tunnel.handleDisableTunnel}
        onShowEnableTunnel={() => tunnel.setShowEnableTunnelModal(true)}
        onShowDisableTunnel={() => tunnel.setShowDisableTunnelModal(true)}
        onShowTsModal={() => tailscale.handleOpenTsModal()}
        onShowDisableTs={() => tailscale.setShowDisableTsModal(true)}
      />

      <TokenSaverCard
        rtkEnabled={settings.rtkEnabled}
        onRtkEnabled={settings.handleRtkEnabled}
        cavemanEnabled={settings.cavemanEnabled}
        onCavemanEnabled={settings.handleCavemanEnabled}
        cavemanLevel={settings.cavemanLevel}
        onCavemanLevel={settings.handleCavemanLevel}
        locale={settings.locale}
      />

      <ApiKeysCard
        keys={apiKeys.keys}
        loading={apiKeys.loading}
        isRemoteHost={remoteHost}
        requireApiKey={settings.requireApiKey}
        onRequireApiKey={settings.handleRequireApiKey}
        visibleKeys={apiKeys.visibleKeys}
        onToggleVisibility={apiKeys.toggleKeyVisibility}
        getMaskedKey={apiKeys.getMaskedKey}
        onCreateKey={() => apiKeys.setShowAddModal(true)}
        onDeleteKey={apiKeys.handleDeleteKey}
        onToggleKey={handleToggleKey}
        confirmState={apiKeys.confirmState}
        onConfirmClose={() => apiKeys.setConfirmState(null)}
      />

      {/* Modals */}
      <CreateKeyModal
        isOpen={apiKeys.showAddModal}
        onClose={() => { apiKeys.setShowAddModal(false); apiKeys.setNewKeyName(""); }}
        value={apiKeys.newKeyName}
        onChange={apiKeys.setNewKeyName}
        onCreate={apiKeys.handleCreateKey}
      />

      <CreatedKeyModal
        createdKey={apiKeys.createdKey}
        onClose={() => apiKeys.setCreatedKey(null)}
      />

      <EnableTunnelModal
        isOpen={tunnel.showEnableTunnelModal}
        onClose={() => tunnel.setShowEnableTunnelModal(false)}
        onConfirm={tunnel.handleEnableTunnel}
      />

      <DisableTunnelModal
        isOpen={tunnel.showDisableTunnelModal}
        onClose={() => tunnel.setShowDisableTunnelModal(false)}
        onConfirm={tunnel.handleDisableTunnel}
        loading={tunnel.tunnelLoading}
      />

      <TailscaleModal
        isOpen={tailscale.showTsModal}
        onClose={() => { if (!tailscale.installHook.tsInstalling) { tailscale.setShowTsModal(false); tailscale.installHook.reset(); } }}
        tsInstalled={tailscale.installHook.tsInstalled}
        tsInstalling={tailscale.installHook.tsInstalling}
        tsInstallLog={tailscale.installHook.tsInstallLog}
        tsLogRef={tailscale.installHook.tsLogRef}
        tsStatus={tailscale.installHook.tsStatus}
        onInstall={tailscale.installHook.handleInstall}
        onConnect={tailscale.handleConnectTailscale}
      />

      <DisableTailscaleModal
        isOpen={tailscale.showDisableTsModal}
        onClose={() => tailscale.setShowDisableTsModal(false)}
        onConfirm={tailscale.handleDisableTailscale}
        loading={tailscale.tsLoading}
      />
    </div>
  );
}

APIPageClient.propTypes = {
  machineId: PropTypes.string,
};
