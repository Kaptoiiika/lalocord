export const covertBase64ToBlob = async (base64: string): Promise<Blob> => {
  const base64Response = await fetch(base64)
  const blob = await base64Response.blob()

  return blob
}
