import { __API_URL__ } from 'src/shared/const/config';

import type {
  FileRespounce,
  imageFormat,
  ImageFormats,
} from 'src/shared/api/types/FilteTypes';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FormateAtributesFile = (file: any): FileRespounce => FormateFile({
  ...file.attributes,
  id: file.id,
});

export const FormateFile = (file: FileRespounce): FileRespounce => {
  const formats: Record<string, imageFormat> = {};

  Object.entries(file.formats || {}).forEach(
    ([key, format]: [string, imageFormat]) => {
      formats[key] = {
        ...format,
        url: __API_URL__ + format.url,
      };
    }
  );

  return {
    ...file,
    url: __API_URL__ + file.url,
    formats: formats as ImageFormats,
  };
};
