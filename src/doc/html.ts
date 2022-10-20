import path from 'node:path'
import fs from 'node:fs'
import MarkdownIt from 'markdown-it'
import axios from 'axios'
import type { DbInfo } from '../types'
import { renderMarkdown } from './markdown'

export async function renderHtml(info: DbInfo): Promise<string> {
  const res = await axios.get('https://cdn.jsdelivr.net/npm/github-markdown-css@5.1.0/github-markdown.css')
  const githubCss = res.data

  const mdStr = renderMarkdown(info)
  const md = MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  })

  const renderStr = md.render(mdStr)
  const htmlStr = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Database Document</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="description" content="Description">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <style>
      .markdown-body {
        box-sizing: border-box;
        min-width: 200px;
        max-width: 980px;
        margin: 0 auto;
        padding: 45px;
      }

      @media (max-width: 767px) {
        .markdown-body {
          padding: 15px;
        }
      }
      ${githubCss}
    </style>
  </head>
  <body>
  <article class="markdown-body">
    ${renderStr}
  </article>
  </body>
  </html>
  `
  return htmlStr
}

export async function generateHtml(docPath: string, info: DbInfo): Promise<string> {
  const htmlStr = await renderHtml(info)
  const mdPath = path.resolve(docPath, `${info.name}.html`)
  fs.writeFileSync(mdPath, htmlStr)
  return mdPath
}
