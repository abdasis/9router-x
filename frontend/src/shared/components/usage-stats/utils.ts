import { AI_PROVIDERS } from "@/shared/constants/providers";
import type { ProviderData, StatsData, GroupResult, GroupSummary } from "./types";

const PROVIDERS_LOOKUP = AI_PROVIDERS as unknown as Record<string, { serviceKinds?: string[] }>;

export function isLLMProvider(id: string): boolean {
  if (id === "leonardo" || id === "weavy") return true;
  const p = PROVIDERS_LOOKUP[id];
  if (!p?.serviceKinds) return true;
  return p.serviceKinds.includes("llm");
}

export function timeAgo(timestamp: string): string {
  if (!timestamp) return "";
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getGroupKey(item: ProviderData, keyField: string): string {
  switch (keyField) {
    case "rawModel":
      return item.rawModel || "Unknown Model";
    case "accountName":
      return item.accountName || `Account ${item.connectionId?.slice(0, 8)}...` || "Unknown Account";
    case "keyName":
      return item.keyName || "Unknown Key";
    case "endpoint":
      return item.endpoint || "Unknown Endpoint";
    default:
      return (item as Record<string, string>)[keyField] || "Unknown";
  }
}

export function sortData(
  dataMap: Record<string, ProviderData> | undefined,
  pendingMap: Record<string, number> = {},
  sortBy: string,
  sortOrder: string
): ProviderData[] {
  return Object.entries(dataMap || {})
    .map(([key, data]) => {
      const totalTokens = (data.promptTokens || 0) + (data.completionTokens || 0);
      const totalCost = data.cost || 0;
      const inputCost = totalTokens > 0 ? (data.promptTokens || 0) * (totalCost / totalTokens) : 0;
      const outputCost = totalTokens > 0 ? (data.completionTokens || 0) * (totalCost / totalTokens) : 0;
      return { ...data, key, totalTokens, totalCost, inputCost, outputCost, pending: pendingMap[key] || 0 };
    })
    .sort((a, b) => {
      let valA = (a as Record<string, string | number>)[sortBy];
      let valB = (b as Record<string, string | number>)[sortBy];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
}

export function groupDataByKey(data: ProviderData[], keyField: string): GroupResult[] {
  if (!Array.isArray(data)) return [];
  const groups: Record<string, GroupResult> = {};
  data.forEach((item) => {
    const gk = getGroupKey(item, keyField);
    if (!groups[gk]) {
      groups[gk] = {
        groupKey: gk,
        summary: {
          requests: 0,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          cost: 0,
          inputCost: 0,
          outputCost: 0,
          lastUsed: null,
          pending: 0,
        } as GroupSummary,
        items: [],
      };
    }
    const s = groups[gk].summary;
    s.requests += item.requests || 0;
    s.promptTokens += item.promptTokens || 0;
    s.completionTokens += item.completionTokens || 0;
    s.totalTokens += item.totalTokens || 0;
    s.cost += item.cost || 0;
    s.inputCost += item.inputCost || 0;
    s.outputCost += item.outputCost || 0;
    s.pending += item.pending || 0;
    if (item.lastUsed && (!s.lastUsed || new Date(item.lastUsed) > new Date(s.lastUsed))) {
      s.lastUsed = item.lastUsed;
    }
    groups[gk].items.push(item);
  });
  return Object.values(groups);
}

export function normalizeStatsData(data: StatsData): StatsData {
  if (!data) return data;
  const next: StatsData = { ...data };

  if (next.byProvider) {
    next.byProvider = { ...next.byProvider };
    const cb = next.byProvider.cb as ProviderData | undefined;
    const codebuddy = next.byProvider.codebuddy as ProviderData | undefined;
    if (cb) {
      if (!codebuddy) {
        (next.byProvider as Record<string, ProviderData>).codebuddy = cb;
      } else {
        next.byProvider.codebuddy = {
          requests: (codebuddy.requests || 0) + (cb.requests || 0),
          promptTokens: (codebuddy.promptTokens || 0) + (cb.promptTokens || 0),
          completionTokens: (codebuddy.completionTokens || 0) + (cb.completionTokens || 0),
          cost: (codebuddy.cost || 0) + (cb.cost || 0),
        };
      }
      delete next.byProvider.cb;
    }
  }

  if (next.byModel) {
    next.byModel = Object.fromEntries(
      Object.entries(next.byModel).map(([key, modelData]) => {
        if (key.endsWith(" (cb)")) {
          const newKey = key.slice(0, -5) + " (codebuddy)";
          return [newKey, { ...modelData, provider: "CodeBuddy" }];
        }
        return [key, modelData];
      })
    );
  }

  if (next.byAccount) {
    next.byAccount = Object.fromEntries(
      Object.entries(next.byAccount).map(([key, accData]) => {
        const p = accData.provider;
        if (p === "cb" || p === "Codebuddy" || p === "codebuddy") {
          return [key, { ...accData, provider: "CodeBuddy" }];
        }
        return [key, accData];
      })
    );
  }

  if (Array.isArray(next.recentRequests)) {
    next.recentRequests = next.recentRequests.map((r) => {
      if (r.provider === "cb") return { ...r, provider: "codebuddy" };
      return r;
    });
  }

  return next;
}
