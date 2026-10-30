import { access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { downloadFfmpeg } from '../electron/main/game_session/ffmpeg_release.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ffmpegPath = path.join(root, 'vendor', 'ffmpeg', 'ffmpeg.exe')

const fileExists = async (filePath) => {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

if (await fileExists(ffmpegPath)) {
  console.log(`ffmpeg already present at ${ffmpegPath}`)
} else {
  await downloadFfmpeg(ffmpegPath)
  console.log(`ffmpeg saved to ${ffmpegPath}`)
}
