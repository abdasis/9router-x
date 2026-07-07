import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import { FREE_PROVIDERS } from "@/shared/constants/providers";
import { isLLMProvider, normalizeStatsData } from "./utils";
import { TABLE_OPTIONS, PERIODS } from "./constants";
import { useActiveTableConfig } from "./use-active-table-config";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import OverviewCards from "@/pages/usage/components/OverviewCards";
import UsageTable from "@/pages/usage/components/UsageTable";
import ProviderTopology from "@/pages/usage/components/ProviderTopology";
import UsageChart from "@/pages/usage/components/UsageChart";
import { RecentRequests } from "./components/recent-requests";
import type { StatsData, TableView, ViewMode, Period } from "./types";

export default function UsageStats({
  period: periodProp,
  setPeriod: setPeriodProp,
  hidePeriodSelector = false,
}: {
  period?: Period;
  setPeriod?: (p: Period) => void;
  hidePeriodSelector?: boolean;
} = {}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sortBy = searchParams.get("sortBy") || "rawModel";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [tableView, setTableView] = useState<TableView>("model");
  const [viewMode, setViewMode] = useState<ViewMode>("costs");
  const [providers, setProviders] = useState<{ provider: string; name: string }[]>([]);
  const [periodLocal, setPeriodLocal] = useState<Period>("today");
  const isInitialLoad = useRef(true);
  const period = periodProp ?? periodLocal;
  const setPeriod = setPeriodProp ?? setPeriodLocal;

  useEffect(() => {
    fetch("/api/providers")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const seen = new Set<string>();
        const unique = (d?.connections || []).filter((c: { isActive?: boolean; provider: string }) => {
          if (c.isActive === false) return false;
          if (!isLLMProvider(c.provider)) return false;
          if (seen.has(c.provider)) return false;
          seen.add(c.provider);
          return true;
        });
        const noAuthProviders = Object.values(FREE_PROVIDERS)
          .filter((p: { noAuth?: boolean; id: string }) => p.noAuth && !seen.has(p.id) && isLLMProvider(p.id))
          .map((p: { id: string; name: string }) => ({ provider: p.id, name: p.name }));
        setProviders([...unique, ...noAuthProviders]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      setLoading(true);
    } else {
      setFetching(true);
    }

    fetch(`/api/usage/stats?period=${period}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          const normalized = normalizeStatsData(data);
          setStats((prev) => ({ ...prev, ...normalized }));
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setFetching(false);
      });
  }, [period]);

  useEffect(() => {
    const es = new EventSource(`/api/usage/stream?period=${period}`);

    es.onmessage = (e) => {
      try {
        const rawData = JSON.parse(e.data);
        const data = normalizeStatsData(rawData);
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error("[SSE CLIENT] parse error:", err);
      }
    };

    es.onerror = () => setLoading(false);

    return () => es.close();
  }, [period]);

  const toggleSort = useCallback(
    (_tableType: string, field: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get("sortBy") === field) {
        params.set("sortOrder", params.get("sortOrder") === "asc" ? "desc" : "asc");
      } else {
        params.set("sortBy", field);
        params.set("sortOrder", "asc");
      }
      navigate(`?${params.toString()}`, { preventScrollReset: true } as never);
    },
    [searchParams, navigate]
  );

  const activeTableConfig = useActiveTableConfig(stats, tableView, sortBy, sortOrder);

  if (!stats && !loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-text-muted">
        <CircleAlert className="size-4" />
        <span>Failed to load usage statistics.</span>
      </div>
    );
  }

  const spinner = (
    <div className="flex items-center justify-center py-12 text-text-muted">
      <Spinner className="size-8" />
    </div>
  );

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {!hidePeriodSelector && (
        <div className="flex w-full items-center gap-2 sm:w-auto sm:self-end">
          <ToggleGroup type="single" value={period} onValueChange={(v) => v && setPeriod(v as Period)}>
            {PERIODS.map((p) => (
              <ToggleGroupItem key={p.value} value={p.value} disabled={fetching} size="sm">
                {p.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {fetching && <Spinner className="size-4 text-text-muted" />}
        </div>
      )}

      {loading ? spinner : <OverviewCards stats={stats} />}

      {loading ? spinner : (
        <div className="grid min-w-0 grid-cols-1 items-stretch gap-2 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <ProviderTopology
            providers={providers as never[]}
            activeRequests={stats?.activeRequests as never[] || []}
            lastProvider={stats?.recentRequests?.[0]?.provider || ""}
            errorProvider={stats?.errorProvider || ""}
          />
          <RecentRequests requests={stats?.recentRequests || []} />
        </div>
      )}

      {loading ? spinner : <UsageChart period={period} lastRequestTime={stats?.recentRequests?.[0]?.timestamp} />}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Select value={tableView} onValueChange={(v) => setTableView(v as TableView)}>
            <SelectTrigger className="w-full sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TABLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as ViewMode)}>
            <ToggleGroupItem value="costs" size="sm">Costs</ToggleGroupItem>
            <ToggleGroupItem value="tokens" size="sm">Tokens</ToggleGroupItem>
          </ToggleGroup>
        </div>
        {loading ? spinner : activeTableConfig && (
          <UsageTable
            title=""
            columns={activeTableConfig.columns}
            groupedData={activeTableConfig.groupedData}
            tableType={tableView}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onToggleSort={toggleSort}
            viewMode={viewMode}
            storageKey={activeTableConfig.storageKey}
            renderSummaryCells={activeTableConfig.renderSummaryCells}
            renderDetailCells={activeTableConfig.renderDetailCells}
            renderGroupLabel={activeTableConfig.renderGroupLabel}
            emptyMessage={activeTableConfig.emptyMessage}
          />
        )}
      </div>
    </div>
  );
}
