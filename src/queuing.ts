import type { LoadRequestData } from "chromecast-caf-receiver/cast.framework.messages.js";
import { MediaFetcher } from "./media_fetcher.js";

/*
 * Set up Debug Logger constants and instance.
 */
const LOG_QUEUE_TAG = "Queue";
const castDebugLogger = cast.debug.CastDebugLogger.getInstance();

if (!castDebugLogger.loggerLevelByTags) {
  castDebugLogger.loggerLevelByTags = {};
}

// Set verbosity level for custom tag.
castDebugLogger.loggerLevelByTags[LOG_QUEUE_TAG] = cast.framework.LoggerLevel.INFO;

/**
 * Custom implementation of the cast receiver queue. The class overrides
 * several QueueBase methods to provide extended queueing functionality such as
 * providing next and previous items in the media queue. Items are populated by
 * fetching them from a backend repository with sample assets.
 */
class CastQueue extends cast.framework.QueueBase {
  constructor() {
    super();
  }

  /**
   * Initializes the queue.
   * @param {!cast.framework.messages.LoadRequestData} loadRequestData
   * @return {!cast.framework.messages.QueueData}
   * @override
   */
  initialize(loadRequestData: LoadRequestData) {
    let queueData = loadRequestData.queueData;

    // Create a new queue with media from load request if one doesn't exist.
    if (!queueData || !queueData.items || !queueData.items.length) {
      castDebugLogger.info(LOG_QUEUE_TAG, "Creating a new queue with media from the load request");
      queueData = new cast.framework.messages.QueueData();
      let item = new cast.framework.messages.QueueItem();
      item.media = loadRequestData.media;
      queueData.items = [item];
    }
    return queueData;
  }

  /**
   * Picks a set of items after the reference item id and returns as the next
   * items to be inserted into the queue. When referenceItemId is omitted, items
   * are simply appended to the end of the queue.
   * @param {number} referenceItemId
   * @return {!Array<cast.framework.QueueItem>}
   * @override
   **/
  nextItems() {
    // Fetch and return sample content with populated metadata.
    return MediaFetcher.fetchMediaInformationById("bbb").then((mediaInformation) => {
      let item = new cast.framework.messages.QueueItem();
      item.media = mediaInformation;
      item.media.customData = { isSuggested: true };
      return [item];
    });
  }

  /**
   * Picks a set of items before the reference item id and returns as the items
   * to be inserted into the queue. When referenceItemId is omitted, items are
   * simply appended to beginning of the queue.
   * @param {number} referenceItemId
   * @return {!Array<cast.framework.QueueItem>}
   * @override
   **/
  prevItems() {
    // Fetch and return sample content with populated metadata.
    return MediaFetcher.fetchMediaInformationById("ed").then((mediaInformation) => {
      let item = new cast.framework.messages.QueueItem();
      item.media = mediaInformation;
      item.media.customData = { isSuggested: true };
      return [item];
    });
  }
}

export { CastQueue };
