import CastDeviceEmulator from "chromecast-device-emulator";
import { ScenarioBuilder } from "../base/ScenarioBuilder";

export function execute() {
  const scenarioBuilder = new ScenarioBuilder();
  const emulator = new CastDeviceEmulator();
  emulator.loadScenario(scenarioBuilder.addLoadEvent().closedCaptionsOn().build());
  emulator.start();
}

execute();
