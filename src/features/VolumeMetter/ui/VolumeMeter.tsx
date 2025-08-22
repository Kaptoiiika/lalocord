import { useEffect, useRef } from 'react';

import styles from './VolumeMeter.module.scss';

type VolumeMeterProps = {
  stream: MediaStream;
};

export const VolumeMeter = (props: VolumeMeterProps) => {
  const { stream } = props;
  const metterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getElement = () => metterRef.current;
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 64;
    const audioSourceNode = audioContext.createMediaStreamSource(stream);

    audioSourceNode.connect(analyser);
    const pcmData = new Uint8Array(analyser.fftSize);

    let isUnmounted = false;

    const onFrame = () => {
      if (isUnmounted) return;
      analyser.getByteFrequencyData(pcmData);
      let sumSquares = 0.0;

      for (const amplitude of pcmData) {
        sumSquares += amplitude * amplitude;
      }
      const strength = 100 - Math.sqrt(sumSquares / pcmData.length);

      window.requestAnimationFrame(onFrame);
      const elem = getElement();

      if (elem) elem.style.transform = `translate(0, ${strength.toFixed(0)}%)`;
    };

    onFrame();

    return () => {
      audioContext.close();
      isUnmounted = true;
    };
  }, [stream]);

  return (
    <div className={styles.volumeMeterWrapper}>
      <div ref={metterRef} className={styles.volumeMeter} />
    </div>
  );
};
