import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(root, 'electron', 'main', 'game_session', 'loopback_exclude.cpp')
const outputDir = path.join(root, 'vendor', 'loopback')
const output = path.join(outputDir, 'loopback_exclude.exe')
const objectFile = path.join(outputDir, 'loopback_exclude.obj')
const vswhere = path.join(
  process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)',
  'Microsoft Visual Studio',
  'Installer',
  'vswhere.exe'
)

if (!existsSync(vswhere)) {
  console.error('Visual Studio was not found')
  process.exit(1)
}

const found = execFileSync(
  vswhere,
  ['-latest', '-products', '*', '-requires', 'Microsoft.VisualStudio.Component.VC.Tools.x86.x64', '-find', 'VC\\Auxiliary\\Build\\vcvars64.bat'],
  { encoding: 'utf8' }
)
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)

const vcvars = found[0]
if (!vcvars) {
  console.error('Visual C++ tools were not found')
  process.exit(1)
}

mkdirSync(outputDir, { recursive: true })
const scriptPath = path.join(outputDir, 'build.bat')
const script = [
  '@echo off',
  `call "${vcvars}"`,
  'if errorlevel 1 exit /b 1',
  `cl /nologo /O2 /MT /EHsc /W3 /std:c++17 /Fo"${objectFile}" /Fe"${output}" "${source}" /link /SUBSYSTEM:WINDOWS /ENTRY:mainCRTStartup ole32.lib mmdevapi.lib`,
  'exit /b %errorlevel%',
].join('\r\n')
writeFileSync(scriptPath, script)
const result = spawnSync('cmd.exe', ['/d', '/c', scriptPath], { stdio: 'inherit', cwd: outputDir })
rmSync(scriptPath, { force: true })
rmSync(objectFile, { force: true })
process.exit(result.status ?? 1)
