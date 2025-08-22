import { classNames } from 'src/shared/lib/classNames/classNames';

import styles from './PageError.module.scss';


type PageErrorProps = {
  className?: string;
  title?: string;
  description?: string;
};

export const PageError = (props: PageErrorProps) => {
  const { className, title = 'Unknow error', description } = props;

  return (
    <div className={classNames(styles.PageError, className)}>
      <h4>{title}</h4>

      <br />
      {description && <span>{description}</span>}
    </div>
  );
};
