import { useState, useEffect } from "react";
import { timeAgo } from "../utils";

export function TimeAgo({ timestamp }: { timestamp: string }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return <>{timeAgo(timestamp)}</>;
}
