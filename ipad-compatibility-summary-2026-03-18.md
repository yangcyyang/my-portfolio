# iPad 兼容性排查记录

日期：2026-03-18
项目：`my-portfolio`
目标页面：`/portfolio`

## 问题现象

在 iPad 打开作品集页面时，顶部区域显示异常，表现为：

- “跳到主要内容”链接直接暴露在页面左上角
- 导航链接接近浏览器默认样式，出现蓝色文本和列表圆点
- 整体观感像是顶部导航区域的样式没有正确生效

从现象判断，不像是单纯的断点问题，更像是 Safari 对部分 CSS 解析失败后，顶部结构退回了默认样式。

## 排查过程

做了以下检查：

1. 定位真实项目目录
   - 发现 `个人网站合集/个人网站` 是软链接
   - 实际项目位于：`/Users/cy/Documents/03 life/AI design/claude code/my-portfolio`

2. 检查页面与布局入口
   - 查看了 `src/layouts/BaseLayout.astro`
   - 查看了 `src/components/Nav.astro`
   - 查看了 `src/styles/global.css`
   - 查看了 `src/pages/portfolio.astro`

3. 检查线上产物
   - 抓取了线上 `https://www.yangcyyang.cn/portfolio`
   - 确认线上页面确实只加载了一份主 CSS：`/_astro/_slug_.DIuyUscw.css`
   - 检查这份 CSS 后发现使用了较多较新的语法：
     - `oklch()`
     - `color-mix()`
     - 多个 `@property`
     - 多个 `@supports`
     - `:has()`

4. 结合现象判断风险点
   - 这些新语法在较旧版本的 iPad Safari 上兼容性并不稳定
   - 一旦某些关键规则解析异常，导航和跳转链接区域就可能退回默认样式

## 本次修改

本次没有大改页面结构，主要做了“关键样式兜底”，保证即使 Tailwind 产物在 iPad Safari 上解析不完整，顶部导航依然能正常显示。

### 1. BaseLayout 增加基础 fallback 样式

文件：

- `src/layouts/BaseLayout.astro`

改动内容：

- 在 `<head>` 内加入少量内联样式
- 为 `body` 增加基础背景色和文字颜色兜底
- 为 “跳到主要内容” 链接增加 `skip-link` 样式兜底

目的：

- 避免 Safari 在样式异常时，页面顶部直接出现一个未修饰的默认跳转链接
- 保证最基础的页面背景和文字色不会丢失

### 2. Nav 增加关键导航样式兜底

文件：

- `src/components/Nav.astro`

改动内容：

- 给导航容器和链接增加语义化 class
- 在组件内加入一套内联样式，覆盖以下关键点：
  - header 定位
  - header 背景和毛玻璃
  - logo 显示
  - 导航列表 `display: flex`
  - 去除列表默认样式
  - 链接颜色、圆角、激活态、hover/focus 态

目的：

- 即使外部 Tailwind 样式部分失效，顶部导航仍然保持正常布局
- 避免出现蓝色默认链接和圆点列表

### 3. 调整平板宽度下的导航布局

文件：

- `src/components/Nav.astro`

改动内容：

- 在 `max-width: 960px` 下：
  - 导航区域改为更稳的纵向头部布局
  - 导航本身允许横向滚动
  - 导航项改为单行不折行展示

目的：

- 提升 iPad 和中等宽度设备下的导航稳定性
- 避免链接挤压换行后破坏布局

### 4. 替换一个更保守的定位写法

文件：

- `src/components/Nav.astro`

改动内容：

- 将 `inset-inline: 0` 改为：
  - `left: 0`
  - `right: 0`

目的：

- 使用更传统的写法，减少旧版 Safari 对逻辑属性支持不完整带来的风险

## 影响文件

- `src/layouts/BaseLayout.astro`
- `src/components/Nav.astro`

## 验证结果

已完成：

- 本地查看页面 HTML，确认 fallback 样式已经注入
- 执行 `npm run build`
- 构建成功，无报错

构建结果：

- 23 个页面成功构建
- 本地构建通过，说明改动没有破坏 Astro 站点产物

## 当前结论

这次问题大概率不是“页面没有写 iPad 断点”这么简单，而是：

- 当前 Tailwind v4 产出的 CSS 使用了较新的颜色和特性语法
- 在部分 iPad Safari 环境中，这些语法可能导致关键样式解析不稳定
- 顶部导航和 skip link 是最先暴露异常的区域

这次加的内联 fallback 属于稳妥修复：

- 不影响现有视觉方向
- 不需要大规模重构样式体系
- 能优先保证 iPad 上顶部区域不再“散掉”

## 后续建议

如果后面还想继续提升 Safari 稳定性，可以再做这几件事：

1. 真机复测 iPad Safari
   - 优先验证 `/portfolio`
   - 再顺带检查首页、作品详情页、博客页

2. 如仍有零散问题，继续补关键模块 fallback
   - 首页 hero
   - 详情页大图展示
   - footer 联系方式弹层

3. 如果未来想系统性解决
   - 评估是否需要对 CSS 构建目标做更保守的降级配置
   - 或减少对部分新语法的依赖

## 备注

本次修改目前只在本地项目中完成，若要让线上站点生效，还需要重新部署。
