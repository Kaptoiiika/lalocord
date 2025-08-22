import type { ImagePreviewSchema } from '../types/ImagePreviewSchema';

export const getCurrentImagePreview = (state: ImagePreviewSchema) => state.selectedFileSrc;

export const getActionSeletFileToImagePreview = (state: ImagePreviewSchema) => state.selectFile;

export const getActionUselectImagePreview = (state: ImagePreviewSchema) => state.unselect;
