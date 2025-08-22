export interface ImagePreviewSchema {
  selectedFileSrc: string | null;

  selectFile: (src: string) => void;
  unselect: () => void;
}
