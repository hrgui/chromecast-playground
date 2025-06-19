export const SENDER_ID = `7f8b100d-a1fe-e60b-5a35-6feaa22976df.2:sender-l4koe754cbxf`;
export const SESSION_ID = "46fd154e-f03d-4d58-986d-4998c43639a7";

export const identifyMessage = {
  applicationId: "628AC8D3",
  applicationName: "CAFV1",
  closedCaption: {},
  deviceCapabilities: {
    bluetooth_supported: true,
    display_supported: true,
    focus_state_supported: true,
    hi_res_audio_supported: false,
  },
  launchingSenderId: SENDER_ID,
  messagesVersion: "1.0",
  sessionId: SESSION_ID,
  type: "ready",
  version: "1.30.113131",
};

export const identifyMessageEvent = {
  data: JSON.stringify(identifyMessage),
  namespace: "urn:x-cast:com.google.cast.system",
  senderId: "SystemSender",
};

export const getStatusMessage = { type: "GET_STATUS", requestId: 889570261 };

export const getStatusEvent = {
  data: JSON.stringify(getStatusMessage),
  namespace: "urn:x-cast:com.google.cast.media",
  senderId: SENDER_ID,
};

export const loadMessage = {
  type: "LOAD",
  requestId: 889570262,
  sessionId: SESSION_ID,
  media: {
    contentId: "bbb",
    streamType: "BUFFERED",
    contentType: "video/mp4",
    metadata: {
      type: 0,
      metadataType: 0,
      title: "Big Buck Bunny",
      images: [
        {
          url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
        },
      ],
    },
  },
  autoplay: true,
};

export const loadEvent = {
  data: JSON.stringify(loadMessage),
  namespace: "urn:x-cast:com.google.cast.media",
  senderId: SENDER_ID,
};

export function createLoadEvent(overrides: any = {}) {
  return {
    data: JSON.stringify({
      ...loadMessage,
      ...overrides,
    }),
    namespace: "urn:x-cast:com.google.cast.media",
    senderId: SENDER_ID,
  };
}
