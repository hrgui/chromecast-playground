import { createLoadEvent, identifyMessageEvent, loadEvent, SENDER_ID } from "./events";

export class ScenarioBuilder {
  currentTime = 0;
  events = [{ time: this.currentTime, ipcMessage: JSON.stringify(identifyMessageEvent) }];

  getAndIncrementTime() {
    this.currentTime = this.currentTime + 50;
    return this.currentTime;
  }

  addLoadEvent(loadOverrides?: any): ScenarioBuilder {
    this.events.push({
      time: this.getAndIncrementTime(),
      ipcMessage: JSON.stringify(createLoadEvent(loadOverrides)),
    });

    return this;
  }

  closedCaptionsOn(overrides = {}): ScenarioBuilder {
    this.events.push({
      time: this.getAndIncrementTime(),
      ipcMessage: JSON.stringify({
        data: JSON.stringify({
          requestId: 3,
          type: "EDIT_TRACKS_INFO",
          enableTextTracks: true,
          mediaSessionId: 1,
          ...overrides,
        }),
        namespace: "urn:x-cast:com.google.cast.media",
        senderId: SENDER_ID,
      }),
    });

    return this;
  }

  build() {
    return {
      timeline: this.events,
    };
  }
}
