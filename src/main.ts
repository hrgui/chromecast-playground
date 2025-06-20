import { CastQueue } from "./queuing";
import { MediaFetcher } from "./media_fetcher";
import type { LoadRequestData } from "chromecast-caf-receiver/cast.framework.messages";

/**
 * @fileoverview This sample demonstrates how to build your own Web Receiver for
 * use with Google Cast. The main receiver implementation is provided in this
 * file which sets up access to the CastReceiverContext and PlayerManager. Some
 * added functionality can be enabled by uncommenting some of the code blocks
 * below.
 */

/*
 * Convenience variables to access the CastReceiverContext and PlayerManager.
 */
const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

/*
 * Constant to be used for fetching media by entity from sample repository.
 */
const ID_REGEX = "/?([^/]+)/?$";

/**
 * Debug Logger
 */
const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
const LOG_RECEIVER_TAG = "Receiver";

/*
 * WARNING: Make sure to turn off debug logger for production release as it
 * may expose details of your app.
 * Uncomment below line to enable debug logger, show a 'DEBUG MODE' tag at
 * top left corner and show debug overlay.
 */
//  context.addEventListener(cast.framework.system.EventType.READY, () => {
//   if (!castDebugLogger.debugOverlayElement_) {
//     /**
//      *  Enable debug logger and show a 'DEBUG MODE' tag at
//      *  top left corner.
//      */
//       castDebugLogger.setEnabled(true);

//     /**
//      * Show debug overlay.
//      */
//       castDebugLogger.showDebugLogs(true);
//   }
// });

/*
 * Set verbosity level for Core events.
 */
castDebugLogger.loggerLevelByEvents = {
  "cast.framework.events.category.CORE": cast.framework.LoggerLevel.INFO,
  "cast.framework.events.EventType.MEDIA_STATUS": cast.framework.LoggerLevel.DEBUG,
};

if (!castDebugLogger.loggerLevelByTags) {
  castDebugLogger.loggerLevelByTags = {};
}

/*
 * Set verbosity level for custom tag.
 * Enables log messages for error, warn, info and debug.
 */
castDebugLogger.loggerLevelByTags[LOG_RECEIVER_TAG] = cast.framework.LoggerLevel.DEBUG;

/*
 * Example of how to listen for events on playerManager.
 */
playerManager.addEventListener(cast.framework.events.EventType.ERROR, (event) => {
  castDebugLogger.error(LOG_RECEIVER_TAG, "Detailed Error Code - " + event.detailedErrorCode);
  if (event && event.detailedErrorCode == 905) {
    castDebugLogger.error(
      LOG_RECEIVER_TAG,
      "LOAD_FAILED: Verify the load request is set up " + "properly and the media is able to play."
    );
  }
});

/*
 * Intercept the LOAD request to load and set the contentUrl.
 */
playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  async (loadRequestData: LoadRequestData) => {
    castDebugLogger.debug(LOG_RECEIVER_TAG, `loadRequestData: ${JSON.stringify(loadRequestData)}`);

    // If the loadRequestData is incomplete, return an error message.
    if (!loadRequestData || !loadRequestData.media) {
      const error = new cast.framework.messages.ErrorData(
        cast.framework.messages.ErrorType.LOAD_FAILED
      );
      error.reason = cast.framework.messages.ErrorReason.INVALID_REQUEST;
      return error;
    }

    // Check all content source fields for the asset URL or ID.
    let source =
      loadRequestData.media.contentUrl ||
      loadRequestData.media.entity ||
      loadRequestData.media.contentId;

    // If there is no source or a malformed ID then return an error.
    if (!source || source == "" || !source.match(ID_REGEX)) {
      let error = new cast.framework.messages.ErrorData(
        cast.framework.messages.ErrorType.LOAD_FAILED
      );
      error.reason = cast.framework.messages.ErrorReason.INVALID_REQUEST;
      return error;
    }

    const sourceId = source.match(ID_REGEX)?.[1] || "";

    try {
      // If the source is a url that points to an asset don't fetch from the
      // content repository.
      if (sourceId.includes(".")) {
        castDebugLogger.debug(LOG_RECEIVER_TAG, "Interceptor received full URL");
        loadRequestData.media.contentUrl = source;
        return loadRequestData;
      } else {
        // Fetch the contentUrl if provided an ID or entity URL.
        castDebugLogger.debug(LOG_RECEIVER_TAG, "Interceptor received ID");
        const res = await MediaFetcher.fetchMediaInformationById(sourceId);
        loadRequestData.media = res;
        return loadRequestData;
      }
    } catch (errorMessage) {
      let error = new cast.framework.messages.ErrorData(
        cast.framework.messages.ErrorType.LOAD_FAILED
      );
      error.reason = cast.framework.messages.ErrorReason.INVALID_REQUEST;
      castDebugLogger.error(LOG_RECEIVER_TAG, errorMessage);
      return error as unknown as LoadRequestData;
    }
  }
);

/*
 * Set the control buttons in the UI controls.
 */
const controls = cast.framework.ui.Controls.getInstance();
controls.clearDefaultSlotAssignments();

// Assign buttons to control slots.
controls.assignButton(
  cast.framework.ui.ControlsSlot.SLOT_SECONDARY_1,
  cast.framework.ui.ControlsButton.QUEUE_PREV
);
controls.assignButton(
  cast.framework.ui.ControlsSlot.SLOT_PRIMARY_1,
  cast.framework.ui.ControlsButton.CAPTIONS
);
controls.assignButton(
  cast.framework.ui.ControlsSlot.SLOT_PRIMARY_2,
  cast.framework.ui.ControlsButton.SEEK_FORWARD_15
);
controls.assignButton(
  cast.framework.ui.ControlsSlot.SLOT_SECONDARY_2,
  cast.framework.ui.ControlsButton.QUEUE_NEXT
);

/*
 * Configure the CastReceiverOptions.
 */
const castReceiverOptions = new cast.framework.CastReceiverOptions();

/*
 * Set the player configuration.
 */
const playbackConfig = new cast.framework.PlaybackConfig();
playbackConfig.autoResumeDuration = 5;
castReceiverOptions.playbackConfig = playbackConfig;
castDebugLogger.info(
  LOG_RECEIVER_TAG,
  `autoResumeDuration set to: ${playbackConfig.autoResumeDuration}`
);

/*
 * Set the SupportedMediaCommands.
 */
castReceiverOptions.supportedCommands =
  cast.framework.messages.Command.ALL_BASIC_MEDIA |
  cast.framework.messages.Command.QUEUE_PREV |
  cast.framework.messages.Command.QUEUE_NEXT |
  cast.framework.messages.Command.EDIT_TRACKS |
  cast.framework.messages.Command.STREAM_TRANSFER;

castReceiverOptions.queue = new CastQueue();

/*
 * Optionally enable a custom queue implementation. Custom queues allow the
 * receiver app to manage and add content to the playback queue. Uncomment the
 * line below to enable the queue.
 */
// castReceiverOptions.queue = new CastQueue();
context.start(castReceiverOptions);
