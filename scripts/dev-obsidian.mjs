#!/usr/bin/env node

import { spawn } from 'child_process'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '..')
const projectRoot = resolve(__dirname, '..')

const astroBin = resolve(
  projectRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'astro.cmd' : 'astro',
)

const children = []

function startProcess(label, command, args) {
  const child = spawn(command, args, {
    cwd: projectRoot,
    env: process.env,
    stdio: 'inherit',
  })

  child.on('error', (error) => {
    console.error(`❌ ${label} 启动失败:`, error.message)
    shutdown(1)
  })

  child.on('exit', (code, signal) => {
    if (signal || code !== 0) {
      console.error(`⚠️  ${label} 已退出`, signal ? `(signal: ${signal})` : `(code: ${code})`)
    }
    shutdown(code ?? 0)
  })

  children.push(child)
}

function shutdown(exitCode = 0) {
  while (children.length > 0) {
    const child = children.pop()
    if (child && !child.killed) {
      child.kill('SIGTERM')
    }
  }

  process.exit(exitCode)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

console.log('🚀 启动 Obsidian 实时同步 + Astro 开发服务器...\n')

startProcess('Obsidian watcher', process.execPath, ['scripts/sync-murmurs.mjs', '--watch'])
startProcess('Astro dev', astroBin, ['dev', '--host', '0.0.0.0', '--port', '4321'])
