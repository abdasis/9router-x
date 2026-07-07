import PropTypes from "prop-types";
import { Card, Button, Toggle, ConfirmModal } from "@/shared/components";
import SecurityWarning from "@/pages/endpoint/components/security-warning";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";

export default function ApiKeysCard({
  keys,
  loading,
  isRemoteHost,
  requireApiKey,
  onRequireApiKey,
  visibleKeys,
  onToggleVisibility,
  getMaskedKey,
  onCopyKey: copyKey,
  onCreateKey,
  onDeleteKey,
  onToggleKey,
  confirmState,
  onConfirmClose,
}) {
  const { copied, copy } = useCopyToClipboard();

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
      </Card>
    );
  }

  return (
    <Card id="require-api-key">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">vpn_key</span>
          API Keys
        </h2>
        <Button icon="add" onClick={onCreateKey}>
          Create Key
        </Button>
      </div>

      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
        <div>
          <p className="font-medium">Require API key</p>
          <p className="text-sm text-text-muted">
            Requests without a valid key will be rejected
          </p>
        </div>
        <Toggle checked={requireApiKey} onChange={() => onRequireApiKey(!requireApiKey)} />
      </div>

      {isRemoteHost && !requireApiKey && (
        <div className="mb-4 -mt-2">
          <SecurityWarning message="Endpoint is exposed without an API key." />
        </div>
      )}

      {keys.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <span className="material-symbols-outlined text-[32px]">vpn_key</span>
          </div>
          <p className="text-text-main font-medium mb-1">No API keys yet</p>
          <p className="text-sm text-text-muted mb-4">Create your first API key to get started</p>
          <Button icon="add" onClick={onCreateKey}>
            Create Key
          </Button>
        </div>
      ) : (
        <div className="flex flex-col">
          {keys.map((key) => (
            <ApiKeyRow
              key={key.id}
              keyData={key}
              copied={copied}
              copy={copy}
              isVisible={visibleKeys.has(key.id)}
              onToggleVisibility={() => onToggleVisibility(key.id)}
              getMaskedKey={getMaskedKey}
              onDelete={() => onDeleteKey(key.id)}
              onToggle={(checked) => onToggleKey(key.id, checked)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmState}
        onClose={onConfirmClose}
        onConfirm={confirmState?.onConfirm}
        title={confirmState?.title || "Confirm"}
        message={confirmState?.message}
        variant="danger"
      />
    </Card>
  );
}

function ApiKeyRow({ keyData, copied, copy, isVisible, onToggleVisibility, getMaskedKey, onDelete, onToggle }) {
  return (
    <div className={`group flex items-center justify-between py-3 border-b border-black/[0.03] dark:border-white/[0.03] last:border-b-0 ${keyData.isActive === false ? "opacity-60" : ""}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{keyData.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <code className="text-xs text-text-muted font-mono">
            {isVisible ? keyData.key : getMaskedKey(keyData.key)}
          </code>
          <button
            onClick={onToggleVisibility}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-text-muted hover:text-primary opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
            title={isVisible ? "Hide key" : "Show key"}
          >
            <span className="material-symbols-outlined text-[14px]">
              {isVisible ? "visibility_off" : "visibility"}
            </span>
          </button>
          <button
            onClick={() => copy(keyData.key, keyData.id)}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-text-muted hover:text-primary opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
          >
            <span className="material-symbols-outlined text-[14px]">
              {copied === keyData.id ? "check" : "content_copy"}
            </span>
          </button>
        </div>
        <p className="text-xs text-text-muted mt-1">
          Created {new Date(keyData.createdAt).toLocaleDateString()}
        </p>
        {keyData.isActive === false && (
          <p className="text-xs text-orange-500 mt-1">Paused</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Toggle
          size="sm"
          checked={keyData.isActive ?? true}
          onChange={(checked) => {
            if (keyData.isActive && !checked) {
              onToggle(false);
            } else {
              onToggle(checked);
            }
          }}
          title={keyData.isActive ? "Pause key" : "Resume key"}
        />
        <button
          onClick={onDelete}
          className="p-2 hover:bg-red-500/10 rounded text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
}

ApiKeysCard.propTypes = {
  keys: PropTypes.array,
  loading: PropTypes.bool,
  isRemoteHost: PropTypes.bool,
  requireApiKey: PropTypes.bool,
  onRequireApiKey: PropTypes.func,
  visibleKeys: PropTypes.object,
  onToggleVisibility: PropTypes.func,
  getMaskedKey: PropTypes.func,
  onCopyKey: PropTypes.func,
  onCreateKey: PropTypes.func,
  onDeleteKey: PropTypes.func,
  onToggleKey: PropTypes.func,
  confirmState: PropTypes.object,
  onConfirmClose: PropTypes.func,
};
