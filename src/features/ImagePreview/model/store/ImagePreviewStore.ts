import { create, StateCreator } from "zustand"
import { ImagePreviewSchema } from "../types/ImagePreviewSchema"

const store: StateCreator<ImagePreviewSchema> = (set, get) => ({
  selectedFileSrc: null,

  selectFile: (src) => {
    set((state) => ({ ...state, selectedFileSrc: src }))
  },
  unselect: () => {
    set((state) => ({ ...state, selectedFileSrc: null }))
  },
})

export const useImagePreviewStore = create(store)
