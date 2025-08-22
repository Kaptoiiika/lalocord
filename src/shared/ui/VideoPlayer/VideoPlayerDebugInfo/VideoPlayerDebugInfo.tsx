import { useEffect, useState } from 'react';

import styles from './VideoPlayerDebugInfo.module.scss';

type VideoPlayerDebugInfoProps = {
  stream: MediaStream | null;
};

export const VideoPlayerDebugInfo = (props: VideoPlayerDebugInfoProps) => {
  const { stream } = props;
  const [debugTime, setTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 250);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className={styles.debuginfo}>
      <pre>
        {stream?.getVideoTracks()?.map((track, index) => {
          const settings = track.getSettings();

          return (
            <h6 key={`${debugTime}-${index}`}>
              video:{settings.groupId}
              {Object.entries(settings).map(([key, value]) => (
                <p key={`${debugTime}-${index}-${key}`}>
                  {key}: {value}
                </p>
              ))}
            </h6>
          );
        })}
      </pre>
      <pre>
        {stream?.getAudioTracks()?.map((track, index) => {
          const settings = track.getSettings();

          return (
            <h6 key={`${debugTime}-${index}`}>
              audio:{settings.groupId}
              {Object.entries(settings).map(([key, value]) => (
                <p key={`${debugTime}-${index}-${key}`}>
                  {key}: {`${value}`}
                </p>
              ))}
            </h6>
          );
        })}
      </pre>
      {stream && <></>}
    </div>
  );
};
