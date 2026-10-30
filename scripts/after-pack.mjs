import { rm } from 'node:fs/promises'
import path from 'node:path'

// Dawn's shader compiler and the software Vulkan ICD. The app does not use WebGPU.
const unusedChromiumFiles = [
  'dxcompiler.dll',
  'dxil.dll',
  'vk_swiftshader.dll',
  'vk_swiftshader_icd.json',
  'vulkan-1.dll',
]

export default async function afterPack(context) {
  await Promise.all(unusedChromiumFiles.map((name) => rm(path.join(context.appOutDir, name), { force: true })))
}
