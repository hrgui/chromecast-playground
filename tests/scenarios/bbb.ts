import CastDeviceEmulator from "chromecast-device-emulator";
import { ScenarioBuilder } from "../base/ScenarioBuilder.ts";

export function execute() {
  const scenarioBuilder = new ScenarioBuilder();
  const emulator = new CastDeviceEmulator();
  emulator.loadScenario(
    scenarioBuilder
      .addLoadEvent({
        media: {
          contentId: "bbb",
        },
      })
      .closedCaptionsOn()
      .build(),
  );
  emulator.start();
}

execute();
