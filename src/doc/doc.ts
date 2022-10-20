import { mkdirSync, readFile } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, resolve } from 'node:path'
import chalk from 'chalk'
import type { DbInfo, DocType } from '../types'
import { generateDocsify } from './site'
import { generateMarkdown } from './markdown'
import { generateHtml } from './html'
import { generatePdf } from './pdf'
import { generateWord } from './word'

function getDocPath(db: string, docType: string): string {
  const currentDir = process.cwd()
  const docPath = resolve(currentDir, 'dist', db, docType)
  mkdirSync(docPath, { recursive: true })
  return docPath
}

function runServer(docPath: string, port = 3333) {
  const server = createServer((req, res) => {
    const url = String(req.url) === '/' ? '/index.html' : String(req.url)
    const filePath = join(docPath, url)
    readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 404
        res.end('not found')
      } else {
        const extName = extname(filePath)
        res.setHeader('content-type', extName)
        res.end(data)
      }
    })
  })
  server.listen(port, () => {
    console.log(chalk.green(`➜ Document is ready: http://127.0.0.1:${port} (Press CTRL+C to quit)`))
  })
}

function printGeneratePath(filePath: string) {
  console.log(chalk.green(`➜ Document is generated: ${filePath}`))
  process.exit(0)
}

export async function generateDoc(docType: DocType, info: DbInfo) {
  const docPath = getDocPath(info.name, docType)
  switch (docType) {
    case 'site':
      generateDocsify(docPath, info)
      runServer(docPath)
      break
    case 'markdwon':
      printGeneratePath(generateMarkdown(docPath, info))
      break
    case 'html':
      printGeneratePath(await generateHtml(docPath, info))
      break
    case 'word':
      printGeneratePath(await generateWord(docPath, info))
      break
    case 'pdf':
      printGeneratePath(await generatePdf(docPath, info))
      break
    default:
      console.log(chalk.red(`Unsupported document type: ${docType}`))
      process.exit(1)
  }
}
