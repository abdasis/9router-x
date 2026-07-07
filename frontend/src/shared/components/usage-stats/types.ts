export interface ProviderData {
  requests?: number;
  promptTokens?: number;
  completionTokens?: number;
  cost?: number;
  inputCost?: number;
  outputCost?: number;
  lastUsed?: string | null;
  pending?: number;
  rawModel?: string;
  provider?: string;
  endpoint?: string;
  accountName?: string;
  connectionId?: string;
  keyName?: string;
  totalTokens?: number;
  totalCost?: number;
}

export interface RequestItem {
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  timestamp?: string;
  status?: string;
  provider?: string;
}

export interface StatsData {
  byProvider?: Record<string, ProviderData>;
  byModel?: Record<string, ProviderData>;
  byAccount?: Record<string, ProviderData>;
  byApiKey?: Record<string, ProviderData>;
  byEndpoint?: Record<string, ProviderData>;
  pending?: {
    byModel?: Record<string, number>;
    byAccount?: Record<string, Record<string, number>>;
  };
  recentRequests?: RequestItem[];
  activeRequests?: unknown[];
  errorProvider?: string;
}

export interface GroupSummary {
  requests: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  inputCost: number;
  outputCost: number;
  lastUsed: string | null;
  pending: number;
}

export interface GroupResult {
  groupKey: string;
  summary: GroupSummary;
  items: ProviderData[];
}

export interface ColumnDef {
  field: string;
  label: string;
  align?: "left" | "right";
}

export type TableView = "model" | "account" | "apiKey" | "endpoint";
export type ViewMode = "costs" | "tokens";
export type Period = "today" | "24h" | "7d" | "30d" | "60d";
