import { test, expect } from "@playwright/test";
import { ScenarioBuilder } from "./base/ScenarioBuilder";
import CastDeviceEmulator from "chromecast-device-emulator";

test("bbb load test", async ({ page }) => {
  const scenarioBuilder = new ScenarioBuilder();
  const emulator = new CastDeviceEmulator();

  scenarioBuilder.addLoadEvent();
  await page.goto("/");
  emulator.loadScenario(scenarioBuilder.build());
  emulator.start();

  const requestPromise = page.waitForRequest(
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  );

  await requestPromise;

  const mediaInfo = await page.evaluate(() => {
    const context = cast.framework.CastReceiverContext.getInstance();
    const playerManager = context.getPlayerManager();
    const mediaInformation = playerManager.getMediaInformation();

    return mediaInformation;
  });

  expect(mediaInfo).not.toBe(null);

  const expected = {
    contentId: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    contentType: "video/mp4",
    contentUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    mediaCategory: "VIDEO",
    metadata: {
      images: [
        {
          url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
        },
      ],
      metadataType: 0,
      title: "Big Buck Bunny",
      type: 0,
    },
    streamType: "BUFFERED",
  };

  expect(mediaInfo).toMatchObject(expected);

  emulator.stop();
});
