import { memo, useId, useRef, useState } from 'react';

import RemoveIcon from '@mui/icons-material/Remove';
import { Button, Stack, Tooltip, Typography } from '@mui/material';
import { classNames } from 'src/shared/lib/classNames/classNames';
import { useIsOpen } from 'src/shared/lib/hooks/useIsOpen/useIsOpen';
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect';
import { startViewTransition } from 'src/shared/lib/utils/ViewTransition/ViewTransition';
import { VideoPlayer } from 'src/shared/ui/VideoPlayer/VideoPlayer';

import styles from './RoomStream.module.scss';

type RoomStreamProps = {
  stream: MediaStream;
  /**
   * default auto
   * if (document.hidden === true) autoplay = true
   * else autoplay = false
   * @type {string}
   */
  autoplay?: boolean;
  hide?: boolean;
  hideId?: number;
  title?: string;
  volume?: number;
  mute?: boolean;
  onHide?: () => void;
  onUnHide?: () => void;
  onVolumeChange?: (volume: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
};

export const RoomStream = memo(function RoomStream(props: RoomStreamProps) {
  const {
    stream,
    title,
    volume = 0,
    mute,
    autoplay: propsAutoPlay,
    hide: propsHide,
    hideId,
    onVolumeChange,
    onHide,
    onPause,
    onPlay,
    onUnHide,
  } = props;
  const componentId = useId().split(':').join('');
  const [autoplay, setAutoplay] = useState(!document.hidden);
  const [played, setPlayed] = useState(false);
  const [hide, setHide] = useState(false);
  const {
    handleOpen: handleOpenfullscreen,
    handleClose: handleClosefullscreen,
    open: fullScreen,
  } = useIsOpen();

  useMountedEffect(() => {
    const fn = () => {
      if (document.hidden) setAutoplay(false);
      else setAutoplay(true);
    };

    document.addEventListener('visibilitychange', fn);

    return () => {
      document.removeEventListener('visibilitychange', fn);
    };
  });

  const handlePause = () => {
    setPlayed(false);
    onPause?.();
  };
  const handlePlay = () => {
    setPlayed(true);
    onPlay?.();
  };

  const handleHide = async () => {
    if (played) handlePause();
    handleClosefullscreen();
    await startViewTransition();
    setHide(true);
    onHide?.();
  };

  const handleUnHide = async () => {
    if (!played) handlePlay();
    await startViewTransition();
    setHide(false);
    onUnHide?.();
  };

  const onUnHideRef = useRef(onUnHide);

  onUnHideRef.current = onUnHide;
  useMountedEffect(() => {
    const getOnUnHideRef = () => onUnHideRef.current;

    return () => {
      getOnUnHideRef()?.();
    };
  });

  const isHidden = propsHide ?? hide;

  return (
    <div
      style={{
        viewTransitionName: componentId,
        left: (hideId ?? 0) * 100,
      }}
      className={classNames(styles.stream, {
        [styles.hideStream]: isHidden,
      })}
    >
      <VideoPlayer
        played={played}
        stream={stream}
        initVolume={volume}
        onVolumeChange={onVolumeChange}
        onPause={handlePause}
        onPlay={handlePlay}
        fullScreen={fullScreen}
        onFullscreenEnter={handleOpenfullscreen}
        onFullscreenExit={handleClosefullscreen}
        autoplay={autoplay ? propsAutoPlay : false}
        controls={!isHidden}
        mute={mute}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          className={styles.streamTooltip}
        >
          <Typography>{title}</Typography>

          <Tooltip title="Hide stream">
            <Button aria-label="Hide stream" onClick={handleHide}>
              <RemoveIcon />
            </Button>
          </Tooltip>
        </Stack>
      </VideoPlayer>

      {isHidden && (
        <div className={styles.unhide}>
          <Tooltip title="Unhide stream">
            <Button aria-label="Unhide stream" onClick={handleUnHide}>
              <RemoveIcon />
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  );
});
