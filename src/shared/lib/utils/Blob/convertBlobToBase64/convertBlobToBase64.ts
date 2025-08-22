export const convertBlobToBase64 = async (blob: Blob): Promise<string> => {
  const data = await new Promise<string | ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (reader.result) resolve(reader.result);
      else reject(null);
    };
    reader.readAsDataURL(blob);
  });

  return data as string;
};
