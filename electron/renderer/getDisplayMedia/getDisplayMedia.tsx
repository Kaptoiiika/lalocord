import { displayMediaSelector } from './displayMediaSelector';

type NumericConstraint = number | { exact?: number; ideal?: number; max?: number };

const readUpperBound = (value: NumericConstraint | undefined, fallback: number) => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (!value || typeof value !== 'object') return fallback;
  if (typeof value.max === 'number' && value.max > 0) return value.max;
  if (typeof value.exact === 'number' && value.exact > 0) return value.exact;
  if (typeof value.ideal === 'number' && value.ideal > 0) return value.ideal;

  return fallback;
};

export const getDisplayMedia = async (
  constatins: MediaStreamConstraints
): Promise<MediaStream> => {
  const { source, allowAudio } = await displayMediaSelector();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set: any = {};

  if (typeof constatins.audio === 'object' && allowAudio === true) {
    const audioConstains: MediaStreamConstraints['audio'] = {
      ...constatins.audio,
    };

    set.audio = {};
    set.audio.mandatory = {
      ...audioConstains,
      chromeMediaSource: 'desktop',
    };
    if (source) set.audio.mandatory.chromeMediaSourceId = source.id;
  }

  if (typeof constatins.video === 'object') {
    const height = readUpperBound(constatins.video.height, 1080);
    const width = readUpperBound(constatins.video.width, Math.round((height * 16) / 9));
    const frameRate = readUpperBound(constatins.video.frameRate, 30);

    set.video = {};
    // Desktop capture only honors maxWidth, maxHeight and frame-rate keys, not height or frameRate.
    set.video.mandatory = {
      chromeMediaSource: 'desktop',
      maxWidth: width,
      maxHeight: height,
      minFrameRate: frameRate,
      maxFrameRate: frameRate,
      cursor: 'always',
    };
    if (source) set.video.mandatory.chromeMediaSourceId = source.id;
  }

  const stream = await navigator.mediaDevices.getUserMedia(set);
  const [videoTrack] = stream.getVideoTracks();

  if (videoTrack) {
    try {
      await videoTrack.applyConstraints({ latency: { ideal: 0 } } as MediaTrackConstraints);
    } catch (error) {
      console.error(error);
    }
  }

  return stream;
};
