import { CastReceiverContext } from "chromecast-caf-receiver/cast.framework";

function makeBeaconRequest({
  id,
  url = "/api/beacon",
  message = "Hello Server!",
}: {
  id: number;
  url?: string;
  message?: string;
}) {
  const data = JSON.stringify({ timestamp: Date.now(), id, message });
  navigator.sendBeacon(url, data);
}

export function setupShutdownListener(context: CastReceiverContext) {
  makeBeaconRequest({ id: 0, message: "I am starting up." });
  context.addEventListener(cast.framework.system.EventType.SHUTDOWN, () => {
    for (let i = 1; i <= 10; i++) {
      makeBeaconRequest({ id: i, message: "I am shutting down." });
    }
  });
}
