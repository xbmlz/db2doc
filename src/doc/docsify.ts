import fs from 'node:fs'
import path from 'node:path'
import type { DbInfo } from '../types'

const DOCSIFY_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Database Document</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="description" content="Description">
  <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <!-- Themes (light + dark) -->
  <link rel="stylesheet" media="(prefers-color-scheme: dark)" href="https://cdn.jsdelivr.net/npm/docsify-themeable@0/dist/css/theme-simple-dark.css">
  <link rel="stylesheet" media="(prefers-color-scheme: light)" href="https://cdn.jsdelivr.net/npm/docsify-themeable@0/dist/css/theme-simple.css">
</head>
<body>
  <div data-app id="main">加载中</div>
  <script>
    window.$docsify = {
      el: '#main',
      name: '',
      repo: '',
      search: 'auto',
      loadSidebar: true
    }
  </script>
  <!-- Required -->
  <script src="https://cdn.jsdelivr.net/npm/docsify@4/lib/docsify.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/docsify-themeable@0/dist/js/docsify-themeable.min.js"></script>

  <!-- Recommended -->
  <script src="https://cdn.jsdelivr.net/npm/docsify@4/lib/plugins/search.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/docsify@4/lib/plugins/zoom-image.min.js"></script>
</body>
</html>
`

export function generateDocsify(docPath: string, info: DbInfo) {
  const sidebarMd: string[] = []
  const readmeMd: string[] = []
  // 标题
  readmeMd.push(`# ${info.name} 数据库文档`, '')
  readmeMd.push('## 基础信息', '')
  readmeMd.push('| 名称 | 版本 | 字符集 | 排序规则 |')
  readmeMd.push('| ---- | ---- | ---- | ---- |')
  readmeMd.push(
    `| ${info.name} | ${info.dialect}-${info.version} | ${info.charset} | ${info.collation} |`,
    ''
  )
  // 表
  for (const i in info.tables) {
    const t = info.tables[i]
    const title = t.comment ? `${t.name}(${t.comment})` : `${t.name}`
    sidebarMd.push(`* [${title}](${t.name}.md)`)
    const tableMd: string[] = []
    tableMd.push(`### ${title}`, '')
    tableMd.push('| 列名 | 类型 | 长度 | 小数位 | 键 | 自增 | 不为空 | 默认值 | 注释 |')
    tableMd.push('| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ')
    for (const j in t.columns) {
      const c = t.columns[j]
      tableMd.push(
        `| ${c.name} | ${c.dataType} | ${c.length} | ${c.scale} | ${c.isPK} | ${c.isIdentity} | ${c.isNullable} | ${c.defaultVal} | ${c.comment} |`
      )
    }
    const tableStr = tableMd.join('\r\n')
    // create [tablename].md
    fs.writeFileSync(path.resolve(docPath, `${t.name}.md`), tableStr)
  }
  // create readme.md
  const readmeMdStr = readmeMd.join('\r\n')
  fs.writeFileSync(path.resolve(docPath, 'README.md'), readmeMdStr)
  // create _sidebar.md
  const sidebarStr = sidebarMd.join('\r\n')
  fs.writeFileSync(path.resolve(docPath, '_sidebar.md'), sidebarStr)
  // create index.html
  fs.writeFileSync(path.resolve(docPath, 'index.html'), DOCSIFY_HTML)
  // create .nojekyll
  fs.writeFileSync(path.resolve(docPath, '.nojekyll'), '')
}
