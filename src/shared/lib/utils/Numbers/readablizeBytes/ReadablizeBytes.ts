export const readablizeBytes = (bytes: number) => {
  const s = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
  const e = Math.floor(Math.log(bytes) / Math.log(1024));

  return (bytes / Math.pow(1024, e)).toFixed(2) + ' ' + s[e];
};
