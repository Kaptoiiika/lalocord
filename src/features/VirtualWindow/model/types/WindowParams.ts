export type PartsType =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "left-top"
  | "right-top"
  | "right-bottom"
  | "left-bottom"
  | "body"

export interface WindowParams {
  width: number
  height: number
  x: number
  y: number
  fullScreen?: boolean
  index?: number
}
