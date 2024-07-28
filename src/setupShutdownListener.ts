import { CastReceiverContext } from "chromecast-caf-receiver/cast.framework";

function makeBeaconRequest({
  id,
  url = "/api/beacon",
  type = "STARTUP",
}: {
  id: number;
  url?: string;
  type?: string;
}) {
  const data = JSON.stringify({ timestamp: Date.now(), id, type });
  navigator.sendBeacon(url, data);
}

export function setupShutdownListener(context: CastReceiverContext) {
  makeBeaconRequest({ id: 0, type: "STARTUP" });
  context.addEventListener(cast.framework.system.EventType.SHUTDOWN, () => {
    for (let i = 1; i <= 10; i++) {
      makeBeaconRequest({ id: i, type: "SHUTDOWN" });
    }
  });
}
