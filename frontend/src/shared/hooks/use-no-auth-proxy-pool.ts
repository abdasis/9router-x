import { useEffect, useState } from "react"

const NONE_PROXY_POOL_VALUE = "__none__"

interface ProxyPool {
  id: string
  name: string
}

interface SettingsData {
  providerStrategies?: Record<string, { proxyPoolId?: string }>
}

export function useNoAuthProxyPool(providerId: string) {
  const [proxyPools, setProxyPools] = useState<ProxyPool[]>([])
  const [proxyPoolId, setProxyPoolId] = useState(NONE_PROXY_POOL_VALUE)
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetch("/api/proxy-pools?isActive=true", { cache: "no-store" }).then(
        (r) => (r.ok ? r.json() : { proxyPools: [] }),
      ),
      fetch("/api/settings", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : {},
      ),
    ]).then(([poolData, settingsData]) => {
      if (cancelled) return
      setProxyPools((poolData as SettingsData).proxyPools || [])
      const override =
        ((settingsData as SettingsData).providerStrategies || {})[providerId] || {}
      setProxyPoolId(override.proxyPoolId || NONE_PROXY_POOL_VALUE)
    }).catch(() => {})

    return () => {
      cancelled = true
    }
  }, [providerId])

  const handleChange = async (newValue: string) => {
    setProxyPoolId(newValue)
    setSaving(true)

    try {
      const res = await fetch("/api/settings", { cache: "no-store" })
      const data: SettingsData = res.ok ? await res.json() : {}
      const current = data.providerStrategies || {}
      const override = { ...(current[providerId] || {}) }

      if (newValue === NONE_PROXY_POOL_VALUE) {
        delete override.proxyPoolId
      } else {
        override.proxyPoolId = newValue
      }

      const updated = { ...current }
      if (Object.keys(override).length === 0) {
        delete updated[providerId]
      } else {
        updated[providerId] = override
      }

      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerStrategies: updated }),
      })

      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 1500)
    } catch {
      // Non-critical — silently ignore
    } finally {
      setSaving(false)
    }
  }

  return {
    proxyPools,
    proxyPoolId,
    saving,
    savedFlash,
    handleChange,
    NONE_PROXY_POOL_VALUE,
  }
}
