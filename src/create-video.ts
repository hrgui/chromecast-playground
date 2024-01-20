import { Muxer, ArrayBufferTarget } from "webm-muxer";

let muxer = new Muxer({
  target: new ArrayBufferTarget(),
  video: {
    codec: "V_VP9",
    width: 1280,
    height: 720,
  },
});

let videoEncoder = new VideoEncoder({
  output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
  error: (e) => console.error(e),
});

videoEncoder.configure({
  codec: "vp09.00.10.08",
  width: 1280,
  height: 720,
  bitrate: 1e6,
  framerate: 30,
});

export async function createVideo(time = 30) {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;

  for (let i = 0; i <= time; i++) {
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "128px sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(i + "", canvas.width / 2, canvas.height / 2);
    let frame = new VideoFrame(canvas, { timestamp: i * 1000000 });
    videoEncoder.encode(frame, { keyFrame: true });
    frame.close();
  }

  await videoEncoder.flush();
  muxer.finalize();

  let { buffer } = muxer.target;

  return URL.createObjectURL(new Blob([buffer]));
}
