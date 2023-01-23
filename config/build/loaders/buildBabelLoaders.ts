import babelRemovePropsPlugin from "../../babel/babelRemovePropsPlugin"
import { BuildOptions } from "../types/config"

export function buildBabelLoaders({ isDev }: BuildOptions) {
  const isProd = !isDev
  const tsxBabelLoader = {
    test: /\.(jsx|tsx)$/,
    exclude: /node_modules/,
    use: {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-env"],
        plugins: [
          [
            "@babel/plugin-transform-typescript",
            {
              isTsx: true,
            },
          ],
          "@babel/plugin-transform-runtime",
          isProd && [
            babelRemovePropsPlugin,
            {
              props: ["data-testid"],
            },
          ],
          isDev && "react-refresh/babel",
        ].filter(Boolean),
      },
    },
  }

  const tsLoader = {
    test: /\.(js|ts)$/,
    exclude: /node_modules/,
    use: {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-env"],
        plugins: [
          "@babel/plugin-transform-typescript",
          "@babel/plugin-transform-runtime",
        ],
      },
    },
  }

  return [tsxBabelLoader, tsLoader]
}
