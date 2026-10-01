import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
// audio-only renders (wav) reject a CRF
if (!process.env.REMOTION_AUDIO_ONLY) Config.setCrf(20);
Config.setOverwriteOutput(true);
// Software WebGL (works without a GPU; needed for the 3D scenes)
Config.setChromiumOpenGlRenderer('swangle');
// Use the pre-installed headless Chromium when available (cloud containers); otherwise Remotion downloads one.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
