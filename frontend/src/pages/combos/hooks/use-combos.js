import { useState, useEffect, useCallback } from "react";

export function useCombos() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProviders, setActiveProviders] = useState([]);
  const [comboStrategies, setComboStrategies] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const [combosRes, providersRes, settingsRes] = await Promise.all([
        fetch("/api/combos"),
        fetch("/api/providers"),
        fetch("/api/settings"),
      ]);
      const combosData = await combosRes.json();
      const providersData = await providersRes.json();
      const settingsData = settingsRes.ok ? await settingsRes.json() : {};

      if (combosRes.ok)
        setCombos((combosData.combos || []).filter((c) => !c.kind));
      if (providersRes.ok)
        setActiveProviders(providersData.connections || []);
      setComboStrategies(settingsData.comboStrategies || {});
    } catch (error) {
      console.log("Error fetching combos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (data) => {
    try {
      const res = await fetch("/api/combos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create combo");
        return false;
      }
      await fetchData();
      return true;
    } catch (error) {
      console.log("Error creating combo:", error);
      return false;
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const res = await fetch(`/api/combos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update combo");
        return false;
      }
      await fetchData();
      return true;
    } catch (error) {
      console.log("Error updating combo:", error);
      return false;
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/combos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCombos((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.log("Error deleting combo:", error);
    }
  };

  const handleToggleRoundRobin = async (comboName, enabled) => {
    try {
      const updated = { ...comboStrategies };
      if (enabled) {
        updated[comboName] = { fallbackStrategy: "round-robin" };
      } else {
        delete updated[comboName];
      }

      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comboStrategies: updated }),
      });

      setComboStrategies(updated);
    } catch (error) {
      console.log("Error updating combo strategy:", error);
    }
  };

  return {
    combos,
    loading,
    activeProviders,
    comboStrategies,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleRoundRobin,
  };
}
