import type { DbInfo } from '../types'

export function createMarkdown(info: DbInfo) {
  const mdArr: string[] = []
  // 标题
  mdArr.push(`# ${info.name} 数据库文档`, '')
  mdArr.push('## 基础信息', '')
  mdArr.push('| 名称 | 版本 | 字符集 | 排序规则 |')
  mdArr.push('| ---- | ---- | ---- | ---- |')
  mdArr.push(
    `| ${info.name} | ${info.dialect}-${info.version} | ${info.charset} | ${info.collation} |`,
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
    mdArr.push(`### ${t.name}(${t.comment})`, '')
    mdArr.push(
      '| 列名 | 类型 | 长度 | 小数位 | 键 | 自增 | 不为空 | 默认值 | 注释 |'
    )
    mdArr.push(
      '| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | '
    )
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
