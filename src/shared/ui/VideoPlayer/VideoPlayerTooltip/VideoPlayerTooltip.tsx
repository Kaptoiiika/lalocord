import type { PropsWithChildren } from 'react';

import { classNames } from 'src/shared/lib/classNames/classNames';

import styles from './VideoPlayerTooltip.module.scss';


type VideoPlayerTooltipProps = {
  open: boolean;
  top?: boolean;
  bottom?: boolean;
  className?: string;
} & PropsWithChildren;

export const VideoPlayerTooltip = (props: VideoPlayerTooltipProps) => {
  const { open, children, top, bottom, className } = props;

  return (
    <div
      className={classNames(styles.tooltip, {
        [styles.closed]: !open,
        [styles.tooltipTop]: top,
        [styles.tooltipBottom]: bottom,
      })}
    >
      <div className={styles.shadowTooltip}>
        <div className={styles.shadow} />
      </div>
      <div className={className}>{children}</div>
    </div>
  );
};
