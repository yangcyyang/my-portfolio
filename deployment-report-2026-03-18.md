# 个人网站部署记录

日期：2026-03-18

## 部署结果

- Vercel 项目：`yangcyyangs-projects/my-portfolio`
- 生产域名：[https://www.yangcyyang.cn](https://www.yangcyyang.cn)
- 本次生产部署地址：[https://my-portfolio-223p69lrz-yangcyyangs-projects.vercel.app](https://my-portfolio-223p69lrz-yangcyyangs-projects.vercel.app)

## 本次已同步内容

- 首页右侧头图与融合样式调整
- 博客列表页“阅读全文”跳转修复
- OpenClaw 橙皮书 PDF 上站
- 个人履历更新与层级整理
- 药监 AI 广告审查项目第 8、9 张图替换

## 关键处理

- 本地 `src/content` 使用了软链接，Vercel 直接部署会导致内容集合为空。
- 本次改用“临时真实内容副本”完成部署，已确保线上是完整内容版本。

## 注意事项

- 后续如果继续通过 Vercel CLI 部署，建议优先使用包含真实 `src/content` 内容的目录，或把内容同步策略改成仓库内真实文件。
- 当前仓库远程地址中包含 GitHub Token，建议尽快轮换并更新远程配置。

## 本地预览

- 本地开发地址：[http://localhost:4321](http://localhost:4321)
