import PropTypes from "prop-types";
import { Cpu } from "lucide-react";
import { Card, Toggle } from "@/shared/components";
import EndpointRow from "@/pages/endpoint/components/endpoint-row";
import TunnelRow from "@/pages/endpoint/components/tunnel-row";
import TailscaleRow from "@/pages/endpoint/components/tailscale-row";
import SecurityWarning from "@/pages/endpoint/components/security-warning";
import Tooltip from "@/pages/endpoint/components/tooltip";

export default function EndpointCard({
  currentEndpoint,
  copied,
  copy,
  tunnelState,
  tsState,
  isLoginUnsafe,
  unsafeReason,
  requireApiKey,
  requireLogin,
  hasPassword,
  tunnelDashboardAccess,
  onTunnelDashboardAccess,
  onEnableTunnel,
  onDisableTunnel,
  onShowEnableTunnel,
  onShowDisableTunnel,
  onShowTsModal,
  onShowDisableTs,
}) {
  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Cpu className="text-primary" size={20} />
        API Endpoint
      </h2>

      <div className="flex flex-col gap-2">
        <EndpointRow
          label="Local"
          url={currentEndpoint}
          copyId="local_url"
          copied={copied}
          onCopy={copy}
        />

        <TunnelRow
          tunnelState={tunnelState}
          copied={copied}
          copy={copy}
          onEnable={onShowEnableTunnel}
          onDisable={onShowDisableTunnel}
        />

        <TailscaleRow
          tsState={tsState}
          copied={copied}
          copy={copy}
          onOpen={onShowTsModal}
          onDisable={onShowDisableTs}
        />
      </div>

      {isLoginUnsafe && !tunnelState.tunnelEnabled && !tsState.tsEnabled && (
        <div className="mt-4">
          <SecurityWarning
            message={unsafeReason}
            action={{ label: "Open settings", href: "/dashboard/profile" }}
          />
        </div>
      )}

      {(tunnelState.tunnelEnabled || tsState.tsEnabled) && (
        <div className="mt-4 flex flex-col gap-2">
          {!requireApiKey && (
            <SecurityWarning
              message="Require API key is disabled — your endpoint is publicly accessible without authentication."
              action={{ label: "Enable", href: "#require-api-key" }}
            />
          )}
          {(!requireLogin || !hasPassword) && (
            <SecurityWarning
              message={
                !requireLogin
                  ? "Require login is disabled — anyone can access your dashboard via tunnel."
                  : "Dashboard uses the default password — change it in Profile settings."
              }
              action={{
                label: !requireLogin ? "Enable" : "Change password",
                href: "/dashboard/profile",
              }}
            />
          )}
        </div>
      )}

      {(tunnelState.tunnelEnabled || tsState.tsEnabled) && (
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
          <Toggle
            checked={tunnelDashboardAccess}
            onChange={() => onTunnelDashboardAccess(!tunnelDashboardAccess)}
          />
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-sm">Allow dashboard access via tunnel</p>
            <Tooltip text="When enabled, the dashboard can be accessed through your tunnel or Tailscale URL (login still required). When disabled, dashboard access via tunnel/Tailscale is completely blocked." />
          </div>
        </div>
      )}
    </Card>
  );
}

EndpointCard.propTypes = {
  currentEndpoint: PropTypes.string,
  copied: PropTypes.string,
  copy: PropTypes.func,
  tunnelState: PropTypes.object,
  tsState: PropTypes.object,
  isLoginUnsafe: PropTypes.bool,
  unsafeReason: PropTypes.string,
  requireApiKey: PropTypes.bool,
  requireLogin: PropTypes.bool,
  hasPassword: PropTypes.bool,
  tunnelDashboardAccess: PropTypes.bool,
  onTunnelDashboardAccess: PropTypes.func,
  onEnableTunnel: PropTypes.func,
  onDisableTunnel: PropTypes.func,
  onShowEnableTunnel: PropTypes.func,
  onShowDisableTunnel: PropTypes.func,
  onShowTsModal: PropTypes.func,
  onShowDisableTs: PropTypes.func,
};
