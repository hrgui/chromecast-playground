import { CastReceiverContext } from "chromecast-caf-receiver/cast.framework";

function makeBeaconRequest({ id, url = "/api/beacon" }: { id: number; url?: string }) {
  const data = new Blob([JSON.stringify({ message: "Hello, Server! " + id + Date.now() })], {
    type: "application/json",
  });

  // Send data using navigator.sendBeacon
  navigator.sendBeacon(url, data);
}

export function setupShutdownListener(context: CastReceiverContext) {
  context.addEventListener(cast.framework.system.EventType.SHUTDOWN, () => {
    makeBeaconRequest({ id: 1 });
  });
}
