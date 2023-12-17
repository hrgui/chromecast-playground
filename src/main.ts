import { CastQueue } from "./queuing";
import { MediaFetcher } from "./media_fetcher";
import type {
  LoadRequestData,
  MediaInformation,
} from "chromecast-caf-receiver/cast.framework.messages";
import initChromecastMux from "@mux/mux-data-chromecast";

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

let firstPlay = true;
let playerInitTime = initChromecastMux.utils.now();

/**
 * Modifies the provided mediaInformation by adding a pre-roll break clip to it.
 * @param {cast.framework.messages.MediaInformation} mediaInformation The target
 * MediaInformation to be modified.
 * @return {Promise} An empty promise.
 */
function addBreaks(mediaInformation: MediaInformation) {
  // let vastTemplate = new cast.framework.messages.VastAdsRequest();
  // vastTemplate.adTagUrl =
  //   "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostlongpod&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&cmsid=496&vid=short_onecue&correlator=" +
  //   new Date().getTime();
  // mediaInformation.vmapAdsRequest = vastTemplate;

  castDebugLogger.debug(LOG_RECEIVER_TAG, "addBreaks: " + JSON.stringify(mediaInformation));
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
        isWatched: false,
        id: "pre-roll",
        breakClipIds: ["fbb_ad"],
        position: 0,
      },
    ];
  });
}

playerManager.setMessageInterceptor(cast.framework.messages.MessageType.MEDIA_STATUS, (status) => {
  console.log(JSON.stringify(status));

  return status;
});

playerManager.addEventListener(cast.framework.events.category.CORE, (playerEvent) => {
  try {
    console.log(
      "Call to playerManager.getStats() succeeded",
      playerEvent.type,
      playerManager.getStats()
    );
  } catch (err) {
    console.error("Call to playerManager.getStats() failed", playerEvent.type, err);
  }
});

let hasPreparedUi = false;

function prepareUi() {
  const castMediaPlayer = document.querySelector("cast-media-player");
  const touchControls = document.querySelector("touch-controls");
  if (touchControls) {
    const style = document.createElement("style");
    style.innerHTML = "goog-break-ui { display:none; }";
    touchControls.shadowRoot?.appendChild(style);
  } else {
    const tvOverlay = castMediaPlayer?.shadowRoot?.querySelector("tv-overlay");

    const style = document.createElement("style");
    style.innerHTML = `.tv-overlay[data-media-category="VIDEO"][data-is-playing-break="true"] .breakOverlay { display:none !important; }`;
    tvOverlay?.shadowRoot?.appendChild(style);
  }

  hasPreparedUi = true;
}

/*
 * Intercept the LOAD request to load and set the contentUrl.
 */
playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  async (loadRequestData: LoadRequestData) => {
    castDebugLogger.debug(LOG_RECEIVER_TAG, `loadRequestData: ${JSON.stringify(loadRequestData)}`);

    if (!hasPreparedUi) {
      prepareUi();
    }

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

    if (firstPlay) {
      initChromecastMux(playerManager, {
        debug: false,
        data: {
          env_key: import.meta.env.VITE_MUX_ENV_KEY, // required

          // Metadata
          player_name: "Custom Player", // ex: 'My Main Player'
          player_init_time: playerInitTime,

          // ... additional metadata
          video_id: sourceId,
        },
      });
      firstPlay = false;
    } else {
      (playerManager as any).mux.emit("videochange", { video_id: sourceId });
    }

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

        if (loadRequestData.media?.customData?.withAds) {
          await addBreaks(res);
        }

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
