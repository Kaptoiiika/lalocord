export type BuildMode = "production" | "development"

export interface BuildPaths {
  entry: string
  build: string
  html: string
  public: string
  src: string
}

export interface BuildOptions {
  mode: BuildMode
  paths: BuildPaths
  port: number
  isDev: boolean
  apiURL: string
  isElectron: boolean
}

export interface BuildEnv {
  mode: BuildMode
  port: number
  apiURL: string
}
