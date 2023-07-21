import obj from "./content.json";

export interface Media {
  author: string;
  description: string;
  poster: string;
  prog: string;
  duration: number;
  stream: Stream;
  title: string;
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
          accept(obj[id as keyof typeof obj]);
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
    return MediaFetcher.fetchMediaById(id).then((item) => {
      let mediaInfo = new cast.framework.messages.MediaInformation();
      let metadata = new cast.framework.messages.GenericMediaMetadata();

      metadata.title = item.title;
      metadata.subtitle = item.description;
      mediaInfo.contentUrl = item.stream.dash;
      mediaInfo.contentType = "application/dash+xml";
      mediaInfo.metadata = metadata;

      return mediaInfo;
    });
  }
}

export { MediaFetcher };
