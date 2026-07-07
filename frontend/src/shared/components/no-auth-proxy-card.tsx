import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useNoAuthProxyPool } from "@/shared/hooks/use-no-auth-proxy-pool"
import { LockOpen } from "lucide-react"

interface NoAuthProxyCardProps {
  providerId: string
}

export function NoAuthProxyCard({ providerId }: NoAuthProxyCardProps) {
  const {
    proxyPools,
    proxyPoolId,
    saving,
    savedFlash,
    handleChange,
    NONE_PROXY_POOL_VALUE,
  } = useNoAuthProxyPool(providerId)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="inline-flex size-10 items-center justify-center rounded-full bg-green-500/10 text-green-500">
            <LockOpen className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">No authentication required</p>
            <p className="text-xs text-muted-foreground">
              This provider is ready to use. Optionally route requests through a
              proxy pool to bypass IP-based limits.
            </p>
          </div>
          {savedFlash && (
            <Badge className="bg-green-500/10 text-green-600">Saved</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label>Proxy Pool</Label>
        <Select
          value={proxyPoolId}
          onValueChange={handleChange}
          disabled={saving}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="None (direct)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_PROXY_POOL_VALUE}>None (direct)</SelectItem>
            {proxyPools.map((pool) => (
              <SelectItem key={pool.id} value={pool.id}>
                {pool.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
