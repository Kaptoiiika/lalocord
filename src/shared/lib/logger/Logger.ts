import { localstorageKeys } from 'src/shared/const/localstorageKeys';

export const getDebugValue = () => !!localStorage.getItem(localstorageKeys.DEBUG);

export const logger = (...arg: unknown[]) => {
  if (getDebugValue()) {
    console.log(...arg);
  }
};
