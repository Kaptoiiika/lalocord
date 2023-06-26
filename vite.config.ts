import {type UserConfig} from 'vite';
import react from '@vitejs/plugin-react'
import path from 'path';
import dotenv from "dotenv"
import svgr from "vite-plugin-svgr";

export default function defineConfig(): UserConfig {
  const isDev = true
  const fileEnv = isDev
    ? dotenv.config({ path: "./.env.development" }).parsed
    : dotenv.config({ path: "./.env" }).parsed

    const PORT = process.env.port || Number(fileEnv?.port) || 3000
    const APIURL = process.env.apiURL || fileEnv?.apiURL || ""

    return {
        plugins: [react(), svgr({ exportAsDefault:true })],
        
        resolve: {
          alias: { "@": path.resolve(__dirname, "src") }}, 
          define:{     
            __IS_DEV__: JSON.stringify(isDev),
            __API_URL__: JSON.stringify(APIURL),
            __IS_ELECTRON__: JSON.stringify(false || false),
            __BUILD_VERSION__: JSON.stringify(
              `${new Date().getDate()}-${
                new Date().getMonth() + 1
              }-${new Date().getFullYear()}`
            ),
        }
    };
}
