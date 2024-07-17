import { Track } from "chromecast-caf-receiver/cast.framework.messages";
import obj from "./content.json";
import { createVideo } from "./create-video";

export interface Media {
  author: string;
  description: string;
  poster: string;
  prog: string;
  duration: number;
  stream: Stream;
  title: string;
  tracks?: Track[];
}

export interface Stream {
  dash: string;
  hls: string;
  hls_ts: string;
}

/**
 * Fetches assets from the sample content repository.
 */
class MediaFetcher {
  /**
   * Obtains the media's details from a remote repository.
   * @param  {string} Entity or ID that contains a key to the media in the
   *     JSON hosted by CONTENT_URL.
   * @return {Promise<Object|string>} Contains the media information of the
   *     desired entity.
   */
  static fetchMediaById(id: string): Promise<Media> {
    return new Promise((accept, reject) => {
      if (obj) {
        if (obj[id as keyof typeof obj]) {
          accept(obj[id as keyof typeof obj] as Media);
        } else {
          reject(`${id} not found in repository.`);
        }
      } else {
        reject("Content repository not found.");
      }
    });
  }

  /**
   * Fetches a media item from the remote repository and creates a DASH stream
   * MediaInformation object from it.
   * @param {String} Entity or ID that contains a key to the media in the
   *     JSON hosted by CONTENT_URL.
   * @return {Promise<cast.framework.messages.MediaInformation|string>} The
   *     MediaInformation object when fetched successfully.
   */
  static fetchMediaInformationById(id: string) {
    return MediaFetcher.fetchMediaById(id).then(async (item) => {
      let mediaInfo = new cast.framework.messages.MediaInformation();
      let metadata = new cast.framework.messages.GenericMediaMetadata();

      metadata.title = item.title;
      metadata.subtitle = item.description;
      if (item.poster) {
        metadata.images = [{ url: item.poster }];
      }
      //const res = await createVideo();

      // mediaInfo.contentUrl = res;
      mediaInfo.contentUrl = "/test.png";
      // mediaInfo.mediaCategory = cast.framework.messages.MediaCategory.IMAGE;

      // mediaInfo.contentType = "video/webm";
      mediaInfo.metadata = metadata;
      mediaInfo.tracks = item.tracks;

      return mediaInfo;
    });
  }
}

export { MediaFetcher };
