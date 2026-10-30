import { execFile } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { copyFile, mkdir, readdir, rename, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pipeline } from 'node:stream/promises'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

// Full GPL build: the game session needs ddagrab plus the hardware H264 encoders.
export const FFMPEG_URL =
  'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n8.1-latest-win64-gpl-8.1.zip'

const findExecutable = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      const nested = await findExecutable(fullPath)
      if (nested) return nested
    }
    if (entry.isFile() && entry.name.toLowerCase() === 'ffmpeg.exe') return fullPath
  }

  return null
}

export const downloadFfmpeg = async (destination) => {
  const workDir = path.join(tmpdir(), `lalocord-ffmpeg-${process.pid}`)
  const zipPath = path.join(workDir, 'ffmpeg.zip')
  const extractDir = path.join(workDir, 'extract')

  await rm(workDir, { recursive: true, force: true })
  await mkdir(extractDir, { recursive: true })

  try {
    const response = await fetch(FFMPEG_URL)
    if (!response.ok || !response.body) {
      throw new Error(`Failed to download ffmpeg: ${response.status} ${response.statusText}`)
    }

    await pipeline(response.body, createWriteStream(zipPath))
    await execFileAsync('tar', ['-xf', zipPath, '-C', extractDir])

    const extracted = await findExecutable(extractDir)
    if (!extracted) throw new Error('ffmpeg.exe was not found in the downloaded archive')

    await mkdir(path.dirname(destination), { recursive: true })
    const partialPath = `${destination}.partial`
    await copyFile(extracted, partialPath)
    await rename(partialPath, destination)
  } finally {
    await rm(workDir, { recursive: true, force: true })
  }
}
