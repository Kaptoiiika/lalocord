import { create } from 'zustand'

import type { ImagePreviewSchema } from '../types/ImagePreviewSchema'
import type { StateCreator } from 'zustand'

const store: StateCreator<ImagePreviewSchema> = (set) => ({
  selectedFileSrc: null,

  selectFile: (src) => {
    set((state) => ({
      ...state,
      selectedFileSrc: src,
    }))
  },
  unselect: () => {
    set((state) => ({
      ...state,
      selectedFileSrc: null,
    }))
  },
})

export const useImagePreviewStore = create(store)
