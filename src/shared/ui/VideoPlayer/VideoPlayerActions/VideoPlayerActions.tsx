import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import { Stack, Slider, IconButton } from '@mui/material';

import { VideoPlayerTooltip } from '../VideoPlayerTooltip/VideoPlayerTooltip';

import styles from './VideoPlayerActions.module.scss';

type VideoPlayerActionsProps = {
  stream: MediaStream | null;
  open: boolean;
  volume?: number;
  fullscreen?: boolean;
  played?: boolean;
  mute?: boolean;
  handlePlayPause?: () => void;
  handleExitFullscreen?: () => void;
  handleFullscreen?: () => void;
  handleChangeVolume?: (event: Event, newValue: number | number[]) => void;
};

const hasAudioOnStream = (stream: MediaStream | null) => !!stream?.getAudioTracks().length;

export const VideoPlayerActions = (props: VideoPlayerActionsProps) => {
  const {
    handleExitFullscreen,
    handleFullscreen,
    handlePlayPause,
    handleChangeVolume,
    volume,
    played,
    open,
    mute,
    fullscreen,
    stream,
  } = props;

  return (
    <VideoPlayerTooltip
      className={styles.actions}
      open={open}
      bottom
    >
      <Stack direction="row" justifyContent="flex-start">
        <IconButton
          aria-label={played ? 'pause video' : 'play video'}
          onClick={handlePlayPause}
        >
          {played
            ? <PauseIcon color="primary" />
            : <PlayArrowIcon color="primary" />}
        </IconButton>
      </Stack>
      <Stack
        className={styles.volume}
        direction="row"
        alignItems="center"
        gap={2}
      >
        <VolumeDown color="primary" />
        <Slider
          disabled={mute || !hasAudioOnStream(stream)}
          aria-label="Volume"
          value={hasAudioOnStream(stream) ? volume : 0}
          onChange={handleChangeVolume}
          step={0.01}
          min={0}
          max={1}
        />
        <VolumeUp color="primary" />
      </Stack>
      <Stack
        direction="row"
        justifyContent="flex-end"
        gap={2}
      >
        {fullscreen ? (
          <IconButton
            aria-label="Exit fullscreen"
            onClick={handleExitFullscreen}
          >
            <FullscreenExitIcon color="primary" />
          </IconButton>
        ) : (
          <IconButton
            aria-label="enter video to fullscreen"
            onClick={handleFullscreen}
          >
            <FullscreenIcon color="primary" />
          </IconButton>
        )}
      </Stack>
    </VideoPlayerTooltip>
  );
};
