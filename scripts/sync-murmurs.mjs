#!/usr/bin/env node

/**
 * 同步脚本：从 Obsidian 碎碎念文件夹 → 网站 src/content/murmurs/
 *
 * 使用：pnpm sync:murmurs
 *
 * 功能：
 * - 读取 Obsidian 碎碎念文件夹中的所有 .md 文件
 * - 清空网站 murmurs 目录
 * - 复制文件，并为缺少 pubDate 的文件自动注入文件修改时间
 * - 打印同步结果
 *
 * 注意：Obsidian 路径硬编码。换机器时需要更新下面的路径。
 */

import { readFileSync, writeFileSync, readdirSync, rmSync, mkdirSync, statSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

// 获取项目根目录
const __dirname = resolve(fileURLToPath(import.meta.url), '..')
const projectRoot = resolve(__dirname, '..')

// === 配置 ===
const OBSIDIAN_PATH = '/Users/cy/Documents/03 life/AI design/cy-AI-mind/碎碎念'
const DEST_PATH = join(projectRoot, 'src/content/murmurs')

console.log(`📂 源: ${OBSIDIAN_PATH}`)
console.log(`📝 目标: ${DEST_PATH}\n`)

// 清空目标目录
try {
  rmSync(DEST_PATH, { recursive: true, force: true })
} catch (err) {
  // 目录可能不存在，忽略
}

// 创建目标目录
mkdirSync(DEST_PATH, { recursive: true })

// 读取 Obsidian 文件夹中的所有 .md 文件
let mdFiles
try {
  mdFiles = readdirSync(OBSIDIAN_PATH).filter(f => f.endsWith('.md'))
} catch (err) {
  console.error(`❌ 无法读取 ${OBSIDIAN_PATH}:`, err.message)
  console.error('💡 检查：')
  console.error('  1. 路径是否正确？')
  console.error('  2. 文件夹是否存在？')
  console.error('  3. 需要在脚本中更新 OBSIDIAN_PATH 吗？')
  process.exit(1)
}

if (mdFiles.length === 0) {
  console.log(`⚠️  Obsidian 碎碎念文件夹为空`)
  console.log(`💡 提示：在 ${OBSIDIAN_PATH} 下新建 .md 文件，然后重新运行此脚本。`)
  process.exit(0)
}

// 处理每个文件
const syncResults = []

mdFiles.forEach(filename => {
  const srcPath = join(OBSIDIAN_PATH, filename)
  const destPath = join(DEST_PATH, filename)

  try {
    let content = readFileSync(srcPath, 'utf-8')
    const originalContent = content

    // 提取 frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)

    if (!frontmatterMatch) {
      console.warn(`⚠️  ${filename}: 无 frontmatter，跳过`)
      return
    }

    const frontmatter = frontmatterMatch[1]

    // 检查是否有 pubDate
    let modified = false
    if (!frontmatter.includes('pubDate:')) {
      const stats = statSync(srcPath)
      const mtime = new Date(stats.mtime).toISOString().split('T')[0]

      // 注入 pubDate
      const newFrontmatter = frontmatter.trim() + `\npubDate: ${mtime}`
      content = content.replace(/^---\n[\s\S]*?\n---/, `---\n${newFrontmatter}\n---`)

      console.log(`  ✏️  ${filename} → pubDate: ${mtime}`)
      modified = true
    }

    // 写入目标文件
    writeFileSync(destPath, content, 'utf-8')

    syncResults.push({
      filename,
      status: modified ? '新增 pubDate' : '同步完成',
    })
  } catch (err) {
    console.error(`  ❌ 处理 ${filename} 时出错:`, err.message)
  }
})

// 总结
console.log(`\n✅ 同步完成！`)
console.log(`   共处理 ${syncResults.length} 篇碎碎念`)
console.log(`\n💡 接下来：`)
console.log(`   1. 开发服务器会自动热更新`)
console.log(`   2. 访问 http://localhost:4322/murmurs 预览`)
console.log(`   3. 满意后提交: git add . && git commit`)
