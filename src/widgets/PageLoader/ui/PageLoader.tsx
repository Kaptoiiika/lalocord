
import LoaderBars from 'src/shared/assets/icons/LoaderBars.svg?react';
import { classNames } from 'src/shared/lib/classNames/classNames';

import styles from './PageLoader.module.scss';

type PageLoaderProps = {
  className?: string;
};

export const PageLoader = (props: PageLoaderProps) => {
  const { className } = props;

  return (
    <div className={classNames(styles.PageLoader, className)}>
      <LoaderBars className={styles.icon} />
    </div>
  );
};
