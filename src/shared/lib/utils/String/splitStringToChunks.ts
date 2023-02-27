export const splitStringToChunks = (str: string, size: number) => {
  const uriString = str
  return size > 0
    ? uriString.match(new RegExp(".{1," + size + "}", "g"))
    : [uriString]
}
