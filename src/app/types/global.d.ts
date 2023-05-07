declare module "*.scss" {
  interface ClassNames {
    [className: string]: string
  }
  const content: ClassNames
  export = content
}

declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  export default content
}

declare module "*.png"
declare module "*.jpg"
declare module "*.mp3"

declare const __IS_DEV__: boolean
declare const __API_URL__: string
declare const __BUILD_VERSION__: string

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T
