import path from 'node:path'
import fs from 'node:fs'
import docx from 'docx'
import type { IPropertiesOptions } from 'docx/build/file/core-properties'
import type { DbInfo } from '../types'

const { Document, Packer, Paragraph, Table, TableRow, TableCell, AlignmentType, HeadingLevel, WidthType } =
  docx

function getDbInfo(info: DbInfo) {
  return new Table({
    alignment: AlignmentType.CENTER,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: '名称' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: '版本' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: '字符集' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: '排序规则' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: '创建时间' })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: info.name })],
          }),
          new TableCell({
            children: [new Paragraph({ text: `${info.dialect}-${info.version}` })],
          }),
          new TableCell({
            children: [new Paragraph({ text: info.charset })],
          }),
          new TableCell({
            children: [new Paragraph({ text: info.collation })],
          }),
          new TableCell({
            children: [new Paragraph({ text: info.time })],
          }),
        ],
      }),
    ],
  })
}

function getOverview(info: DbInfo) {
  const tableHead = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ text: '序号' })],
      }),
      new TableCell({
        children: [new Paragraph({ text: '表名' })],
      }),
      new TableCell({
        children: [new Paragraph({ text: '描述' })],
      }),
    ],
  })
  const tableBody = []
  for (let i = 0; i < info.tables.length; i++) {
    const table = info.tables[i]
    tableBody.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: `${i + 1}` })],
          }),
          new TableCell({
            children: [new Paragraph({ text: table.name })],
          }),
          new TableCell({
            children: [new Paragraph({ text: table.comment })],
          }),
        ],
      })
    )
  }
  return new Table({
    alignment: AlignmentType.CENTER,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [tableHead, ...tableBody],
  })
}

// 列名 | 类型 | 长度 | 小数位 | 键 | 自增 | 不为空 | 默认值 | 注释
function getTables(info: DbInfo) {
  const tables = []
  const head = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ text: '列名' })],
      }),
      new TableCell({
        children: [new Paragraph({ text: '类型' })],
      }),
      new TableCell({
        children: [new Paragraph({ text: '长度' })],
      }),
      new TableCell({
        children: [new Paragraph({ text: '小数位' })],
      }),
      new TableCell({
        children: [new Paragraph({ text: '键' })],
      }),
      new TableCell({
        children: [new Paragraph({ text: '自增' })],
      }),
      new TableCell({
        children: [new Paragraph({ text: '不为空' })],
      }),
      new TableCell({
        children: [new Paragraph({ text: '默认值' })],
      }),
      new TableCell({
        children: [new Paragraph({ text: '注释' })],
      }),
    ],
  })
  for (let i = 0; i < info.tables.length; i++) {
    const t = info.tables[i]
    const title = t.comment ? `${t.name}(${t.comment})` : `${t.name}`
    const rows = []
    for (let j = 0; j < t.columns.length; j++) {
      const c = t.columns[j]
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: c.name })],
            }),
            new TableCell({
              children: [new Paragraph({ text: c.dataType })],
            }),
            new TableCell({
              children: [new Paragraph({ text: c.length as string })],
            }),
            new TableCell({
              children: [new Paragraph({ text: c.scale as string })],
            }),
            new TableCell({
              children: [new Paragraph({ text: c.isPK as string })],
            }),
            new TableCell({
              children: [new Paragraph({ text: c.isIdentity as string })],
            }),
            new TableCell({
              children: [new Paragraph({ text: c.isNullable as string })],
            }),
            new TableCell({
              children: [new Paragraph({ text: c.defaultVal })],
            }),
            new TableCell({
              children: [new Paragraph({ text: c.comment })],
            }),
          ],
        })
      )
    }
    tables.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 120 },
      }),
      new Table({
        alignment: AlignmentType.CENTER,
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [head, ...rows],
      })
    )
  }
  return tables
}

export async function generateWord(docPath: string, info: DbInfo): Promise<string> {
  const wordPath = path.resolve(docPath, `${info.name}.docx`)
  const options: IPropertiesOptions = {
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: `${info.name} 数据库文档`,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: '数据库信息',
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 120 },
          }),
          getDbInfo(info),
          new Paragraph({
            text: '表概览',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 120 },
          }),
          getOverview(info),
          new Paragraph({
            text: '表结构',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 120 },
          }),
          ...getTables(info),
        ],
      },
    ],
  }
  const doc = new Document(options)

  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(wordPath, buffer)
  return wordPath
}
