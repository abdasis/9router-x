import { useMemo } from "react";
import { sortData, groupDataByKey } from "./utils";
import {
  MODEL_COLUMNS, ACCOUNT_COLUMNS, API_KEY_COLUMNS, ENDPOINT_COLUMNS,
} from "./constants";
import BadgeRaw from "@/shared/components/Badge";
import { fmt, fmtTime } from "@/pages/usage/components/UsageTable";
import type { StatsData, TableView, GroupResult, ProviderData } from "./types";

const Badge = BadgeRaw as (props: {
  children: React.ReactNode;
  variant?: string;
  size?: string;
}) => React.ReactElement | null;

function badgeVariant(pending: boolean | number | undefined): "primary" | "default" {
  return pending ? "primary" : "default";
}

export function useActiveTableConfig(
  stats: StatsData | null,
  tableView: TableView,
  sortBy: string,
  sortOrder: string
) {
  return useMemo(() => {
    if (!stats) return null;

    const base = (cols: typeof MODEL_COLUMNS, data: ReturnType<typeof groupDataByKey>, storageKey: string, msg: string) => ({
      columns: cols,
      groupedData: data,
      storageKey,
      emptyMessage: msg,
      renderGroupLabel: () => null,
      renderSummaryCells: (group: GroupResult) => (
        <>
          <td className="px-6 py-3 text-text-muted">&mdash;</td>
          <td className="px-6 py-3 text-text-muted">&mdash;</td>
          <td className="px-6 py-3 text-right">{fmt(group.summary.requests)}</td>
          <td className="px-6 py-3 text-right text-text-muted whitespace-nowrap">{fmtTime(group.summary.lastUsed)}</td>
        </>
      ),
    });

    switch (tableView) {
      case "model": {
        const pendingMap = stats.pending?.byModel || {};
        const cfg = base(MODEL_COLUMNS, groupDataByKey(sortData(stats.byModel, pendingMap, sortBy, sortOrder), "rawModel"), "usage-stats:expanded-models", "No usage recorded yet.");
        return {
          ...cfg,
          renderSummaryCells: (group: GroupResult) => (
            <>
              <td className="px-6 py-3 text-text-muted">&mdash;</td>
              <td className="px-6 py-3 text-right">{fmt(group.summary.requests)}</td>
              <td className="px-6 py-3 text-right text-text-muted whitespace-nowrap">{fmtTime(group.summary.lastUsed)}</td>
            </>
          ),
          renderDetailCells: (item: ProviderData) => (
            <>
              <td className={`px-6 py-3 font-medium transition-colors ${item.pending ? "text-primary" : ""}`}>{item.rawModel}</td>
              <td className="px-6 py-3"><Badge variant={badgeVariant(item.pending)} size="sm">{item.provider}</Badge></td>
              <td className="px-6 py-3 text-right">{fmt(item.requests)}</td>
              <td className="px-6 py-3 text-right text-text-muted whitespace-nowrap">{fmtTime(item.lastUsed)}</td>
            </>
          ),
        };
      }
      case "account": {
        const pendingMap: Record<string, number> = {};
        if (stats?.pending?.byAccount) {
          Object.entries(stats.byAccount || {}).forEach(([accountKey, data]) => {
            const connPending = stats.pending!.byAccount![data.connectionId!];
            if (connPending) {
              const modelKey = data.provider ? `${data.rawModel} (${data.provider})` : data.rawModel;
              pendingMap[accountKey] = connPending[modelKey || ""] || 0;
            }
          });
        }
        const cfg = base(ACCOUNT_COLUMNS, groupDataByKey(sortData(stats.byAccount, pendingMap, sortBy, sortOrder), "accountName"), "usage-stats:expanded-accounts", "No account-specific usage recorded yet.");
        return {
          ...cfg,
          renderSummaryCells: (group: GroupResult) => (
            <>
              <td className="px-6 py-3 text-text-muted">&mdash;</td>
              <td className="px-6 py-3 text-text-muted">&mdash;</td>
              <td className="px-6 py-3 text-right">{fmt(group.summary.requests)}</td>
              <td className="px-6 py-3 text-right text-text-muted whitespace-nowrap">{fmtTime(group.summary.lastUsed)}</td>
            </>
          ),
          renderDetailCells: (item: ProviderData) => (
            <>
              <td className={`px-6 py-3 font-medium transition-colors ${item.pending ? "text-primary" : ""}`}>
                {item.accountName || `Account ${item.connectionId?.slice(0, 8)}...`}
              </td>
              <td className={`px-6 py-3 font-medium transition-colors ${item.pending ? "text-primary" : ""}`}>{item.rawModel}</td>
              <td className="px-6 py-3"><Badge variant={badgeVariant(item.pending)} size="sm">{item.provider}</Badge></td>
              <td className="px-6 py-3 text-right">{fmt(item.requests)}</td>
              <td className="px-6 py-3 text-right text-text-muted whitespace-nowrap">{fmtTime(item.lastUsed)}</td>
            </>
          ),
        };
      }
      case "apiKey": {
        const cfg = base(API_KEY_COLUMNS, groupDataByKey(sortData(stats.byApiKey, {}, sortBy, sortOrder), "keyName"), "usage-stats:expanded-apikeys", "No API key usage recorded yet.");
        return {
          ...cfg,
          renderDetailCells: (item: ProviderData) => (
            <>
              <td className="px-6 py-3 font-medium">{item.keyName}</td>
              <td className="px-6 py-3">{item.rawModel}</td>
              <td className="px-6 py-3"><Badge variant="default" size="sm">{item.provider}</Badge></td>
              <td className="px-6 py-3 text-right">{fmt(item.requests)}</td>
              <td className="px-6 py-3 text-right text-text-muted whitespace-nowrap">{fmtTime(item.lastUsed)}</td>
            </>
          ),
        };
      }
      case "endpoint":
      default: {
        const cfg = base(ENDPOINT_COLUMNS, groupDataByKey(sortData(stats.byEndpoint, {}, sortBy, sortOrder), "endpoint"), "usage-stats:expanded-endpoints", "No endpoint usage recorded yet.");
        return {
          ...cfg,
          renderDetailCells: (item: ProviderData) => (
            <>
              <td className="px-6 py-3 font-medium font-mono text-sm">{item.endpoint}</td>
              <td className="px-6 py-3">{item.rawModel}</td>
              <td className="px-6 py-3"><Badge variant="default" size="sm">{item.provider}</Badge></td>
              <td className="px-6 py-3 text-right">{fmt(item.requests)}</td>
              <td className="px-6 py-3 text-right text-text-muted whitespace-nowrap">{fmtTime(item.lastUsed)}</td>
            </>
          ),
        };
      }
    }
  }, [stats, tableView, sortBy, sortOrder]);
}
