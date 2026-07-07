import { CLIENT_PING_TIMEOUT_MS, REACHABLE_MISS_THRESHOLD } from "@/pages/endpoint/constants/endpoint";

export async function clientPingUrl(url) {
  if (!url) return false;
  try {
    const res = await fetch(`${url}/api/health`, {
      mode: "cors",
      cache: "no-store",
      signal: AbortSignal.timeout(CLIENT_PING_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function clientPingAny(...urls) {
  const checks = urls.filter(Boolean).map(clientPingUrl);
  if (!checks.length) return false;
  return new Promise((resolve) => {
    let pending = checks.length;
    checks.forEach((p) =>
      p.then((ok) => {
        if (ok) resolve(true);
        else if (--pending === 0) resolve(false);
      })
    );
  });
}

export function maskKey(fullKey) {
  if (!fullKey) return "";
  return fullKey.length > 8 ? fullKey.slice(0, 8) + "..." : fullKey;
}

export function isRemoteHost() {
  if (typeof window === "undefined") return false;
  return !["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}
