import { create, type StateCreator } from 'zustand'

type CanvasPainterStore = {
  strokeWidth: number
  color: string
}

const store: StateCreator<CanvasPainterStore> = (set) => ({
  color: '#f00',
  strokeWidth: 8,

  setColor: (color: string) => {
    set((state) => ({
      ...state,
      color,
    }))
  },
  setStrokeWidth: (strokeWidth: number) => {
    set((state) => ({
      ...state,
      strokeWidth,
    }))
  },
})
export const useCanvasPainterStore = create(store)

