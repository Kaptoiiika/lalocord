import { execFile, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

import { app } from 'electron'

import { createAnnexBSplitter } from './annexb'

const execFileAsync = promisify(execFile)

const encoderOrder = ['h264_nvenc', 'h264_amf', 'h264_qsv', 'libx264'] as const

export type HardwareEncoder = (typeof encoderOrder)[number]

export const resolveFfmpegPath = () => {
  const packagedPath = path.join(process.resourcesPath, 'ffmpeg', 'ffmpeg.exe')
  if (existsSync(packagedPath)) return packagedPath

  return path.join(app.getAppPath(), 'vendor', 'ffmpeg', 'ffmpeg.exe')
}

const evenSize = (value: number) => Math.max(2, Math.floor(value / 2) * 2)

export const fitCaptureSize = (width: number, height: number, maxWidth: number, maxHeight: number) => {
  const scale = Math.min(1, maxWidth / width, maxHeight / height)
  return {
    width: evenSize(width * scale),
    height: evenSize(height * scale),
  }
}

const readEncoders = async (ffmpegPath: string) => {
  const { stdout } = await execFileAsync(ffmpegPath, ['-hide_banner', '-encoders'], { windowsHide: true })

  return encoderOrder.find((encoder) => stdout.includes(encoder)) ?? null
}

const encoderArguments = (encoder: HardwareEncoder, frameRate: number, bitrateBits: number) => {
  const bitrate = String(Math.max(1, Math.round(bitrateBits)))
  const buffer = String(Math.max(1, Math.round(bitrateBits / 4)))
  // Half a second between keyframes, matching the previous 30-frame GOP at 60 fps.
  const group = String(Math.max(1, Math.round(frameRate / 2)))
  const rate = ['-b:v', bitrate, '-maxrate', bitrate, '-bufsize', buffer, '-bf', '0', '-g', group]

  if (encoder === 'h264_nvenc') {
    return ['-c:v', 'h264_nvenc', '-preset', 'p1', '-tune', 'ull', '-rc', 'cbr', '-forced-idr', '1', '-aud', '1'].concat(rate)
  }
  if (encoder === 'h264_amf') {
    return ['-c:v', 'h264_amf', '-usage', 'ultralowlatency', '-rc', 'cbr', '-quality', 'speed'].concat(rate)
  }
  if (encoder === 'h264_qsv') {
    return ['-c:v', 'h264_qsv', '-preset', 'veryfast', '-look_ahead', '0'].concat(rate)
  }

  return ['-c:v', 'libx264', '-preset', 'ultrafast', '-tune', 'zerolatency', '-x264-params', 'aud=1:repeat-headers=1'].concat(rate)
}

const captureFilter = (
  encoder: HardwareEncoder,
  outputIndex: number,
  width: number,
  height: number,
  frameRate: number,
  isNativeSize: boolean
) => {
  const grab = `ddagrab=output_idx=${outputIndex}:framerate=${frameRate}:draw_mouse=1`

  // scale_d3d11 fails to allocate its output texture in this build (0x80070057).
  // NVENC can take the desktop texture directly when the frame is already within the cap.
  if (encoder === 'h264_nvenc' && isNativeSize) return grab

  const pixelFormat = encoder === 'h264_nvenc' ? 'nv12' : 'yuv420p'

  return `${grab},hwdownload,format=bgra,scale=${width}:${height},format=${pixelFormat}`
}

export type CaptureHandle = {
  encoder: HardwareEncoder
  stop: () => void
  exitError: () => Error | null
}

export const startDesktopCapture = async (options: {
  outputIndex: number
  width: number
  height: number
  frameRate: number
  bitrate: number
  isNativeSize: boolean
  onFrame: (frame: { data: Uint8Array; isKey: boolean }) => void
  onExit: (error: Error | null) => void
}): Promise<CaptureHandle> => {
  const ffmpegPath = resolveFfmpegPath()
  if (!existsSync(ffmpegPath)) {
    throw new Error('ffmpeg.exe was not found. Run npm run fetch:ffmpeg')
  }

  const encoder = await readEncoders(ffmpegPath)
  if (!encoder) throw new Error('ffmpeg has no H264 encoder')

  const { stdout: filters } = await execFileAsync(ffmpegPath, ['-hide_banner', '-filters'], { windowsHide: true })
  if (!filters.includes('ddagrab')) throw new Error('ffmpeg was built without ddagrab')

  const filter = captureFilter(
    encoder,
    options.outputIndex,
    options.width,
    options.height,
    options.frameRate,
    options.isNativeSize
  )
  const args = ['-hide_banner', '-loglevel', 'error', '-filter_complex', filter]
    .concat(encoderArguments(encoder, options.frameRate, options.bitrate))
    .concat(['-flags', 'low_delay', '-an', '-f', 'h264', 'pipe:1'])

  const child = spawn(ffmpegPath, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  if (!child.stdout || !child.stderr) throw new Error('ffmpeg pipes were not created')
  const splitter = createAnnexBSplitter(options.onFrame)
  let stderr = ''
  let stopped = false
  let exitError: Error | null = null

  child.stdout.on('data', (chunk: Buffer) => {
    splitter.push(chunk)
  })
  child.stderr.on('data', (chunk: Buffer) => {
    stderr = `${stderr}${chunk.toString()}`.slice(-4000)
  })
  child.on('exit', (code) => {
    if (stopped) {
      options.onExit(null)
      return
    }
    exitError = new Error(stderr || `ffmpeg exited with code ${code ?? 'unknown'}`)
    options.onExit(exitError)
  })

  return {
    encoder,
    stop: () => {
      stopped = true
      child.kill()
    },
    exitError: () => exitError,
  }
}
