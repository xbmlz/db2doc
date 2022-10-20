// import type { DbInfo } from '../types'

// export async function generateWord(docPath: string, info: DbInfo): Promise<string> {
//   const htmlStr = await renderHtml(info)
//   const fileBuffer = await asBlob(htmlStr)
//   const wordPath = path.resolve(docPath, `${info.name}.docx`)
//   // @ts-expect-error buffer
//   fs.writeFileSync(wordPath, fileBuffer)
//   return wordPath
// }
