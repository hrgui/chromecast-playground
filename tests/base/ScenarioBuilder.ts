import { identifyMessageEvent, loadEvent } from "./events";

export class ScenarioBuilder {
  currentTime = 0;
  events = [{ time: this.currentTime, ipcMessage: JSON.stringify(identifyMessageEvent) }];

  getAndIncrementTime() {
    this.currentTime = this.currentTime + 50;
    return this.currentTime;
  }

  addLoadEvent() {
    this.events.push({ time: this.getAndIncrementTime(), ipcMessage: JSON.stringify(loadEvent) });
  }

  build() {
    return {
      timeline: this.events,
    };
  }
}
