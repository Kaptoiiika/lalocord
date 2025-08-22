export interface FileRespounce {
  id: number;
  url: string;
  name?: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  hash?: string;
  ext?: string;
  mime?: string;
  size?: number;
  previewUrl?: string;
  provider?: string;
  createdAt?: string;
  updatedAt?: string;
  formats?: ImageFormats;
  // ??
  caption?: unknown;
  provider_metadata?: unknown;
}

export type ImageFormats = Record<imageFormatVariant, imageFormat>;

export type imageFormat = {
  url: string;
  ext?: string;
  hash?: string;
  mime?: string;
  name?: string;
  path?: string;
  size?: number;
  width?: number;
  height?: number;
};

export type imageFormatVariant = 'large' | 'small' | 'medium' | 'thumbnail';
