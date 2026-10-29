import { createWriteStream } from 'node:fs'
import { mkdir, rm, access } from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const vendorDir = path.join(root, 'vendor', 'ffmpeg')
const ffmpegPath = path.join(vendorDir, 'ffmpeg.exe')
const zipPath = path.join(vendorDir, 'ffmpeg.zip')

// BtbN autobuild that includes the ddagrab demuxer and the hardware H264 encoders.
const FFMPEG_URL =
  'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n8.1-latest-win64-gpl-8.1.zip'

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
  process.exit(0)
}

await mkdir(vendorDir, { recursive: true })

const response = await fetch(FFMPEG_URL)
if (!response.ok || !response.body) {
  throw new Error(`Failed to download ffmpeg: ${response.status} ${response.statusText}`)
}

await pipeline(response.body, createWriteStream(zipPath))

const extractDir = path.join(vendorDir, 'extract')
await rm(extractDir, { recursive: true, force: true })
await mkdir(extractDir, { recursive: true })
await execFileAsync('tar', ['-xf', zipPath, '-C', extractDir])

const { stdout } = await execFileAsync('powershell', [
  '-NoProfile',
  '-Command',
  `Get-ChildItem -Path '${extractDir}' -Recurse -Filter ffmpeg.exe | Select-Object -First 1 -ExpandProperty FullName`,
])
const extracted = stdout.trim()
if (!extracted) throw new Error('ffmpeg.exe was not found in the downloaded archive')

const { copyFile } = await import('node:fs/promises')
await copyFile(extracted, ffmpegPath)
await rm(extractDir, { recursive: true, force: true })
await rm(zipPath, { force: true })

console.log(`ffmpeg saved to ${ffmpegPath}`)
