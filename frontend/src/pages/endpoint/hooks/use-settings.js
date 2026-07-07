import { useState, useEffect } from "react";

export default function useSettings() {
  const [requireApiKey, setRequireApiKey] = useState(false);
  const [requireLogin, setRequireLogin] = useState(true);
  const [hasPassword, setHasPassword] = useState(true);
  const [tunnelDashboardAccess, setTunnelDashboardAccess] = useState(false);
  const [rtkEnabled, setRtkEnabled] = useState(true);
  const [cavemanEnabled, setCavemanEnabled] = useState(false);
  const [cavemanLevel, setCavemanLevel] = useState("full");
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) return;
      const data = await res.json();
      setRequireApiKey(data.requireApiKey || false);
      setRequireLogin(data.requireLogin !== false);
      setHasPassword(data.hasPassword || false);
      setTunnelDashboardAccess(data.tunnelDashboardAccess || false);
      setRtkEnabled(data.rtkEnabled !== false);
      setCavemanEnabled(!!data.cavemanEnabled);
      setCavemanLevel(data.cavemanLevel || "full");
    } catch {
      // ignore
    }
  };

  const patchSetting = async (patch) => {
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch {
      // ignore
    }
  };

  const handleRequireApiKey = async (value) => {
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requireApiKey: value }),
      });
      if (res.ok) setRequireApiKey(value);
    } catch {
      // ignore
    }
  };

  const handleTunnelDashboardAccess = async (value) => {
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tunnelDashboardAccess: value }),
      });
      if (res.ok) setTunnelDashboardAccess(value);
    } catch {
      // ignore
    }
  };

  const handleRtkEnabled = async (value) => {
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rtkEnabled: value }),
      });
      if (res.ok) setRtkEnabled(value);
    } catch {
      // ignore
    }
  };

  const handleCavemanEnabled = (value) => {
    setCavemanEnabled(value);
    patchSetting({ cavemanEnabled: value });
  };

  const handleCavemanLevel = (level) => {
    setCavemanLevel(level);
    patchSetting({ cavemanLevel: level });
  };

  return {
    requireApiKey, setRequireApiKey,
    requireLogin, setRequireLogin,
    hasPassword, setHasPassword,
    tunnelDashboardAccess, setTunnelDashboardAccess,
    rtkEnabled, setRtkEnabled,
    cavemanEnabled, setCavemanEnabled,
    cavemanLevel, setCavemanLevel,
    locale, setLocale,
    handleRequireApiKey,
    handleTunnelDashboardAccess,
    handleRtkEnabled,
    handleCavemanEnabled,
    handleCavemanLevel,
    patchSetting,
    fetchSettings,
  };
}
