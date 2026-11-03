import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const parents = [
  { name: 'rolldown', prefix: '@rolldown/binding-' },
  { name: 'lightningcss', prefix: 'lightningcss-' },
  { name: '@tailwindcss/oxide', prefix: '@tailwindcss/oxide-' },
]

const linuxLibc = () => {
  if (process.platform !== 'linux') return null

  try {
    const report = process.report?.getReport?.()
    if (report?.header?.glibcVersionRuntime) return 'gnu'
    if (Array.isArray(report?.sharedObjects) && report.sharedObjects.some((file) => file.includes('libc.musl-') || file.includes('ld-musl-'))) {
      return 'musl'
    }
  } catch {
    // process.report is unavailable in some embeds
  }

  try {
    if (readFileSync('/usr/bin/ldd', 'utf8').includes('musl')) return 'musl'
  } catch {
    // Alpine and other musl images may not have this file
  }

  return 'gnu'
}

const hostSuffixes = () => {
  const { platform, arch } = process

  if (platform === 'linux') {
    const libc = linuxLibc()
    if (arch === 'arm') return libc === 'musl' ? ['linux-arm-musl', 'linux-arm-gnueabihf'] : ['linux-arm-gnueabihf']
    return [`linux-${arch}-${libc}`]
  }

  if (platform === 'win32') return [`win32-${arch}-msvc`]
  if (platform === 'darwin') return [`darwin-${arch}`]
  if (platform === 'android' && arch === 'arm') return ['android-arm-eabi']
  if (platform === 'android') return [`android-${arch}`]
  if (platform === 'freebsd') return [`freebsd-${arch}`]

  return [`${platform}-${arch}`]
}

const readOptionalDependencies = (packageName) => {
  const packageJsonPath = path.join(root, 'node_modules', ...packageName.split('/'), 'package.json')
  if (!existsSync(packageJsonPath)) return null

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  return packageJson.optionalDependencies ?? {}
}

const installedVersion = (packageName) => {
  const packageJsonPath = path.join(root, 'node_modules', ...packageName.split('/'), 'package.json')
  if (!existsSync(packageJsonPath)) return null

  try {
    return JSON.parse(readFileSync(packageJsonPath, 'utf8')).version ?? null
  } catch {
    return null
  }
}

const runNpm = (args, cwd) => {
  const env = { ...process.env }
  delete env.npm_config_omit
  delete env.npm_config_include

  const npmCli = env.npm_execpath
  if (npmCli && existsSync(npmCli)) {
    execFileSync(process.execPath, [npmCli, ...args], { cwd, env, stdio: 'inherit' })
    return
  }

  const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  execFileSync(npmBin, args, {
    cwd,
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
}

// Install in a throwaway project. `npm install` in the app root reconciles the
// whole tree and, with optional deps omitted, removes Electron and other packages.
const installBinding = (packageName, version) => {
  const staging = path.join(root, `.native-binding-${process.pid}`)
  rmSync(staging, { recursive: true, force: true })
  mkdirSync(staging, { recursive: true })
  writeFileSync(path.join(staging, 'package.json'), JSON.stringify({ private: true }))

  try {
    runNpm(
      ['install', '--no-save', '--ignore-scripts', '--no-package-lock', '--no-audit', '--no-fund', `${packageName}@${version}`],
      staging,
    )

    const unpacked = path.join(staging, 'node_modules', ...packageName.split('/'))
    if (!existsSync(path.join(unpacked, 'package.json'))) {
      throw new Error(`npm install did not produce ${packageName}`)
    }

    const destination = path.join(root, 'node_modules', ...packageName.split('/'))
    rmSync(destination, { recursive: true, force: true })
    mkdirSync(path.dirname(destination), { recursive: true })
    cpSync(unpacked, destination, { recursive: true })
  } finally {
    rmSync(staging, { recursive: true, force: true })
  }
}

const suffixes = hostSuffixes()
let failed = false

for (const parent of parents) {
  const optionalDependencies = readOptionalDependencies(parent.name)
  if (!optionalDependencies) continue

  const match = suffixes
    .map((suffix) => {
      const name = `${parent.prefix}${suffix}`
      const version = optionalDependencies[name]
      return version ? { name, version } : null
    })
    .find(Boolean)

  if (!match) {
    console.error(`ensure-native-bindings: ${parent.name} has no binding for ${suffixes.join(', ')}`)
    failed = true
    continue
  }

  if (installedVersion(match.name) === match.version) {
    console.log(`ensure-native-bindings: ${match.name}@${match.version} already present`)
    continue
  }

  console.log(`ensure-native-bindings: installing ${match.name}@${match.version}`)
  try {
    installBinding(match.name, match.version)
  } catch (error) {
    console.error(`ensure-native-bindings: failed to install ${match.name}@${match.version}`)
    console.error(error instanceof Error ? error.message : error)
    failed = true
  }
}

if (failed) process.exitCode = 1
