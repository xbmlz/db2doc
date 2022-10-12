import { mkdirSync, readFile } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, resolve } from 'node:path'
import type { DbInfo } from '../types'
import { generateDocsify } from './docsify'

function getDocPath(db: string, fmt: string): string {
  const currentDir = process.cwd()
  const docPath = resolve(currentDir, 'dist', db, fmt)
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
  server.listen(port)
}

export function generateDoc(fmt: string, info: DbInfo) {
  const docPath = getDocPath(info.name, fmt)
  switch (fmt) {
    case 'docsify':
      generateDocsify(docPath, info)
      runServer(docPath)
      break
    default:
      process.exit(1)
  }
}
