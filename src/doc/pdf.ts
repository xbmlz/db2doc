import fs from 'node:fs'
import path from 'node:path'
import PdfMake from 'pdfmake'
import type { Content, TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces'
import type { DbInfo } from '../types'

function getOverview(info: DbInfo) {
  const heads = ['序号', '表名', '描述']
  const rows = []
  for (let i = 0; i < info.tables.length; i++) {
    const t = info.tables[i]
    rows.push([i + 1, t.name, t.comment])
  }
  const tableBody = [heads, ...rows]
  return tableBody
}

function getTables(info: DbInfo) {
  const tableBody: Content = []
  for (let i = 0; i < info.tables.length; i++) {
    const t = info.tables[i]
    const title = t.comment ? `${t.name}(${t.comment})` : `${t.name}`
    const heads = ['列名', '类型', '长度', '小数位', '键', '自增', '不为空', '默认值', '注释']
    const rows = []
    for (let j = 0; j < t.columns.length; j++) {
      const c = t.columns[j]
      rows.push([
        c.name,
        c.dataType,
        c.length,
        c.scale,
        c.isPK,
        c.isIdentity,
        c.isNullable,
        c.defaultVal,
        c.comment,
      ])
    }
    tableBody.push(
      {
        text: title,
        style: 'tableHeader',
        fontSize: 15,
        bold: true,
        margin: [0, 20, 0, 6],
      },
      {
        style: 'tableExample',
        table: {
          headerRows: 1,
          body: [heads, ...rows],
        },
      }
    )
  }
  return tableBody
}

export function generatePdf(docPath: string, info: DbInfo): Promise<string> {
  const fontPath = path.resolve(process.cwd(), 'fonts', 'msyh.ttf')
  const fonts: TFontDictionary = {
    Msyh: {
      normal: fontPath,
      bold: fontPath,
      italics: fontPath,
      bolditalics: fontPath,
    },
  }
  const docDefinition: TDocumentDefinitions = {
    defaultStyle: {
      font: 'Msyh',
    },
    content: [
      {
        text: `${info.name} 数据库文档`,
        style: 'header',
        fontSize: 30,
        alignment: 'center',
        margin: [0, 360, 0, 0],
        bold: true,
        pageBreak: 'after',
      },
      {
        text: '数据库信息',
        style: 'subheader',
        fontSize: 20,
        bold: true,
        margin: [0, 20, 0, 6],
      },
      {
        style: 'tableExample',
        table: {
          headerRows: 1,
          widths: ['auto', 50, 50, 100, 120],
          body: [
            ['名称', '版本', '编码', '排序规则', '创建时间'],
            [info.name, info.version, info.charset, info.collation, info.time],
          ],
        },
      },
      {
        text: '表概览',
        style: 'subheader',
        fontSize: 20,
        bold: true,
        margin: [0, 20, 0, 6],
      },
      {
        style: 'tableExample',
        table: {
          widths: [50, 180, 250],
          body: getOverview(info),
        },
        pageBreak: 'after',
      },
      {
        text: '表信息',
        style: 'subheader',
        fontSize: 20,
        bold: true,
      },
      // 表信息
      ...getTables(info),
    ],
  }
  return new Promise<string>((resolve, reject) => {
    const make = new PdfMake(fonts)
    const pdfpath = path.join(docPath, `${info.name}.pdf`)
    const stream = fs.createWriteStream(pdfpath)
    const pdf = make.createPdfKitDocument(docDefinition)
    pdf.pipe(stream)
    pdf.end()
    stream.on('finish', () => {
      resolve(pdfpath)
    })
    stream.on('error', (err) => {
      reject(err)
    })
  })
}
