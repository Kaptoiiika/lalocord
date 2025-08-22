export const splitStringToChunks = (str: string, size: number): string[] => {
  const uriString = str;
  const correctNumber = Math.max(1, Math.floor(size));
  const value =
    correctNumber >= 1
      ? uriString.match(new RegExp('.{1,' + correctNumber + '}', 'g'))
      : [uriString];

  return value === null ? [uriString] : value;
};
