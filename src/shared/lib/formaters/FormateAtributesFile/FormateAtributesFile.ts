import {
  FileRespounce,
  imageFormat,
  ImageFormats,
} from "@/shared/api/types/FilteTypes"

export const FormateAtributesFile = (file: any): FileRespounce => {
  return FormateFile({
    ...file.attributes,
    id: file.id,
  })
}

export const FormateFile = (file: FileRespounce): FileRespounce => {
  const formats: Record<string, imageFormat> = {}
  Object.entries(file.formats || {}).forEach(
    ([key, format]: [string, imageFormat]) => {
      formats[key] = { ...format, url: __API_URL__ + format.url }
    }
  )

  return {
    ...file,
    url: __API_URL__ + file.url,
    formats: formats as ImageFormats,
  }
}
