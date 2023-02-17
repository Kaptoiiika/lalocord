import { FileRespounce } from "@/shared/api/types/FilteTypes"

export const FormateAtributesFile = (file: any): FileRespounce => {
  return {
    ...file.attributes,
    id: file.id,
  }
}
