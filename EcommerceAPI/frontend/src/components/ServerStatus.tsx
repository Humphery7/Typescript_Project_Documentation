import { useSyncExternalStore } from "react";
import { slowStore } from "../lib/api";

/** Free hosting tiers put the API to sleep; say so instead of leaving people staring at a blank page. */
export function ServerStatus() {
  const slow = useSyncExternalStore(slowStore.subscribe, slowStore.getSnapshot, () => false);
  if (!slow) return null;
  return (
    <div className="server-status" role="status">
      <div className="wrap">
        The shop server is waking up. Free hosting pauses when idle, so the first request can take up to a minute.
      </div>
    </div>
  );
}
