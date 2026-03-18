#!/usr/bin/env node

/**
 * 同步脚本：从 Obsidian 碎碎念文件夹 → 网站 src/content/murmurs/
 *
 * 使用：
 * - node scripts/sync-murmurs.mjs
 * - node scripts/sync-murmurs.mjs --watch
 *
 * 功能：
 * - 读取 Obsidian 碎碎念文件夹中的所有 .md 文件
 * - 同步到网站 murmurs 目录
 * - 为缺少 pubDate 的文件自动注入文件修改时间
 * - watch 模式下持续监听 Obsidian 文件变更
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  watch,
  writeFileSync,
} from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '..')
const projectRoot = resolve(__dirname, '..')

const WATCH_MODE = process.argv.includes('--watch')
const OBSIDIAN_PATH =
  process.env.OBSIDIAN_PATH || '/Users/cy/Documents/03 life/AI design/cy-AI-mind/碎碎念'
const DEST_PATH = join(projectRoot, 'src/content/murmurs')

const pendingTimers = new Map()

console.log(`📂 源: ${OBSIDIAN_PATH}`)
console.log(`📝 目标: ${DEST_PATH}`)
console.log(`👀 模式: ${WATCH_MODE ? 'watch' : 'single run'}\n`)

function assertSourceReadable() {
  try {
    readdirSync(OBSIDIAN_PATH)
  } catch (err) {
    console.error(`❌ 无法读取 ${OBSIDIAN_PATH}:`, err.message)
    console.error('💡 检查：')
    console.error('  1. 路径是否正确？')
    console.error('  2. 文件夹是否存在？')
    console.error('  3. 是否要通过环境变量 OBSIDIAN_PATH 覆盖默认路径？')
    process.exit(1)
  }
}

function ensureDestDir() {
  mkdirSync(DEST_PATH, { recursive: true })
}

function listMarkdownFiles(dirPath) {
  return readdirSync(dirPath)
    .filter((filename) => filename.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
}

function transformContent(srcPath, filename) {
  let content = readFileSync(srcPath, 'utf-8')
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)

  if (!frontmatterMatch) {
    console.warn(`⚠️  ${filename}: 无 frontmatter，跳过`)
    return null
  }

  const frontmatter = frontmatterMatch[1]
  let modified = false

  if (!frontmatter.includes('pubDate:')) {
    const stats = statSync(srcPath)
    const mtime = new Date(stats.mtime).toISOString().split('T')[0]
    const newFrontmatter = `${frontmatter.trim()}\npubDate: ${mtime}`
    content = content.replace(/^---\n[\s\S]*?\n---/, `---\n${newFrontmatter}\n---`)
    modified = true
  }

  return { content, modified }
}

function syncFile(filename, reason = '同步完成') {
  if (!filename.endsWith('.md')) {
    return false
  }

  const srcPath = join(OBSIDIAN_PATH, filename)
  const destPath = join(DEST_PATH, filename)

  if (!existsSync(srcPath)) {
    if (existsSync(destPath)) {
      rmSync(destPath, { force: true })
      console.log(`🗑️  ${filename} → 已删除`)
      return true
    }
    return false
  }

  try {
    const result = transformContent(srcPath, filename)
    if (!result) {
      return false
    }

    writeFileSync(destPath, result.content, 'utf-8')
    console.log(`${result.modified ? '✏️ ' : '✅'} ${filename} → ${result.modified ? '补充 pubDate' : reason}`)
    return true
  } catch (err) {
    console.error(`❌ 处理 ${filename} 时出错:`, err.message)
    return false
  }
}

function pruneDeletedFiles(sourceFiles) {
  const sourceSet = new Set(sourceFiles)
  const destFiles = existsSync(DEST_PATH) ? listMarkdownFiles(DEST_PATH) : []

  destFiles.forEach((filename) => {
    if (!sourceSet.has(filename)) {
      rmSync(join(DEST_PATH, filename), { force: true })
      console.log(`🧹 ${filename} → 移除目标中的旧文件`)
    }
  })
}

function syncAll(reason = '全量同步') {
  assertSourceReadable()
  ensureDestDir()

  const mdFiles = listMarkdownFiles(OBSIDIAN_PATH)
  pruneDeletedFiles(mdFiles)

  if (mdFiles.length === 0) {
    console.log(`⚠️  Obsidian 碎碎念文件夹为空`)
    return 0
  }

  let syncedCount = 0
  mdFiles.forEach((filename) => {
    if (syncFile(filename, reason)) {
      syncedCount += 1
    }
  })

  console.log(`\n✅ 同步完成：${syncedCount} 篇碎碎念\n`)
  return syncedCount
}

function debounceByFile(filename, task) {
  const key = filename || '__all__'
  const currentTimer = pendingTimers.get(key)

  if (currentTimer) {
    clearTimeout(currentTimer)
  }

  const nextTimer = setTimeout(() => {
    pendingTimers.delete(key)
    task()
  }, 150)

  pendingTimers.set(key, nextTimer)
}

function startWatchMode() {
  syncAll('初始化同步')
  console.log('🔄 正在监听 Obsidian 目录变化，保存后会自动同步到 Astro...\n')

  const watcher = watch(OBSIDIAN_PATH, (eventType, rawFilename) => {
    const filename = rawFilename?.toString()

    debounceByFile(filename, () => {
      if (!filename) {
        console.log('📡 检测到目录级变化，执行全量同步')
        syncAll('目录变更同步')
        return
      }

      if (!filename.endsWith('.md')) {
        return
      }

      syncFile(filename, eventType === 'rename' ? '重命名/新建同步' : '内容变更同步')
    })
  })

  const shutdown = () => {
    watcher.close()
    console.log('\n🛑 已停止监听 Obsidian 目录')
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

if (WATCH_MODE) {
  startWatchMode()
} else {
  syncAll()
}
