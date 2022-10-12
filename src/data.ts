import chalk from 'chalk'
import type { DbDialect, DocType } from './types'

export const DIALECTS: DbDialect[] = [
  {
    name: 'MySQL',
    value: 'mysql',
    port: 3306,
    user: 'root',
    color: chalk.green,
  },
  {
    name: 'PostgreSQL',
    value: 'postgres',
    port: 5432,
    user: 'postgres',
    color: chalk.blue,
  },
]

export const DOC_TYPES: DocType[] = [
  {
    name: 'Excel',
    value: 'xlsx',
    mode: 'local',
    color: chalk.green,
  },
  {
    name: 'Word',
    value: 'docx',
    mode: 'local',
    color: chalk.blue,
  },
  {
    name: 'Html',
    value: 'html',
    mode: 'local',
    color: chalk.red,
  },
  {
    name: 'Markdown',
    value: 'markdwon',
    mode: 'local',
    color: chalk.cyan,
  },
  {
    name: 'Docsify',
    value: 'docsify',
    mode: 'server',
    color: chalk.green,
  },
  {
    name: 'Gitbook',
    value: 'gitbook',
    mode: 'server',
    color: chalk.blue,
  },
]
