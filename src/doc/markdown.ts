import fs from 'node:fs'
import path from 'node:path'
import type { DbInfo } from '../types'

export function renderMarkdown(info: DbInfo): string {
  const mdArr: string[] = []
  // 标题
  mdArr.push(`# ${info.name} 数据库文档`, '')
  mdArr.push('## 基础信息', '')
  mdArr.push('| 名称 | 版本 | 字符集 | 排序规则 | 创建时间 |')
  mdArr.push('| ---- | ---- | ---- | ---- | ---- |')
  mdArr.push(
    `| ${info.name} | ${info.dialect}-${info.version} | ${info.charset} | ${info.collation} | ${info.time} |`,
    ''
  )
  // 表总览
  mdArr.push('## 表目录', '')
  mdArr.push('| 序号 | 表名 | 描述 |')
  mdArr.push('| ---- | ---- | ---- |')
  for (const i in info.tables) {
    const t = info.tables[i]
    mdArr.push(`| ${i + 1} | ${t.name} | ${t.comment} |`)
  }
  mdArr.push('')
  // 表信息
  mdArr.push('## 表信息', '')
  for (const i in info.tables) {
    const t = info.tables[i]
    const title = t.comment ? `${t.name}(${t.comment})` : `${t.name}`
    mdArr.push(`### ${title}`, '')
    mdArr.push('| 列名 | 类型 | 长度 | 小数位 | 键 | 自增 | 不为空 | 默认值 | 注释 |')
    mdArr.push('| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ')
    for (const j in t.columns) {
      const c = t.columns[j]
      mdArr.push(
        `| ${c.name} | ${c.dataType} | ${c.length} | ${c.scale} | ${c.isPK} | ${c.isIdentity} | ${c.isNullable} | ${c.defaultVal} | ${c.comment} |`
      )
    }
    mdArr.push('')
  }
  return mdArr.join('\r\n')
}

export function generateMarkdown(docPath: string, info: DbInfo): string {
  const mdStr = renderMarkdown(info)
  const mdPath = path.resolve(docPath, `${info.name}.md`)
  fs.writeFileSync(mdPath, mdStr)
  return mdPath
}
