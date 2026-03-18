#!/usr/bin/env node

/**
 * 内容同步脚本：从 Obsidian 个人网站内容/ → src/content/
 *
 * 使用：pnpm sync
 *
 * 同步范围：blog / projects / murmurs / resume / profile / config.ts
 * 不同步：导航文件（00_* 01_*）、草稿（*-draft.md）
 */

import { cpSync, existsSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = resolve(fileURLToPath(import.meta.url), '..')
const projectRoot = resolve(__dirname, '..')

const SRC = join(projectRoot, '../个人网站内容')
const DEST = join(projectRoot, 'src/content')

const SYNC_DIRS = ['blog', 'projects', 'murmurs', 'resume', 'profile']

if (!existsSync(SRC)) {
  console.error(`❌ 内容目录不存在：${SRC}`)
  process.exit(1)
}

mkdirSync(DEST, { recursive: true })

for (const dir of SYNC_DIRS) {
  const srcDir = join(SRC, dir)
  const destDir = join(DEST, dir)
  if (existsSync(srcDir)) {
    cpSync(srcDir, destDir, { recursive: true })
    console.log(`✅ ${dir}/`)
  }
}

const configSrc = join(SRC, 'config.ts')
if (existsSync(configSrc)) {
  cpSync(configSrc, join(DEST, 'config.ts'))
  console.log('✅ config.ts')
}

console.log('\n同步完成，可以 git commit && git push 了')
