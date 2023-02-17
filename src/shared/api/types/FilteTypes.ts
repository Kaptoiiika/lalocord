export interface FileRespounce {
  id: number
  url: string
  name?: string
  alternativeText?: string
  width?: number
  height?: number
  hash?: string
  ext?: string
  mime?: string
  size?: number
  previewUrl?: string
  provider?: string
  createdAt?: string
  updatedAt?: string
  formats?: {
    large: imageFormats
    small: imageFormats
    medium: imageFormats
    thumbnail: imageFormats
  }
  // ??
  caption?: any
  provider_metadata?: any
}

type imageFormats = {
  url: string
  ext?: string
  hash?: string
  mime?: string
  name?: string
  path?: string
  size?: number
  width?: number
  height?: number
}
