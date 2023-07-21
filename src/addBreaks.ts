import { MediaInformation } from "chromecast-caf-receiver/cast.framework.messages";
import { MediaFetcher } from "./media_fetcher";

/**
 * Modifies the provided mediaInformation by adding a pre-roll break clip to it.
 * @param {cast.framework.messages.MediaInformation} mediaInformation The target
 * MediaInformation to be modified.
 * @return {Promise} An empty promise.
 */
export function addBreaks(mediaInformation: MediaInformation) {
  return MediaFetcher.fetchMediaById("fbb_ad").then((clip1) => {
    mediaInformation.breakClips = [
      {
        id: "fbb_ad",
        title: clip1.title,
        contentUrl: clip1.stream.dash,
        contentType: "application/dash+xml",
        whenSkippable: 5,
      },
    ];

    mediaInformation.breaks = [
      {
        id: "pre-roll",
        breakClipIds: ["fbb_ad"],
        position: 0,
        isWatched: false,
      },
    ];
  });
}
