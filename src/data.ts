import chalk from 'chalk'
import type { DbDialect, DocTypes } from './types'

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

export const DOC_TYPES: DocTypes[] = [
  {
    name: 'Site',
    value: 'docsify',
    color: chalk.magenta,
  },
  {
    name: 'Excel',
    value: 'xlsx',
    color: chalk.green,
  },
  {
    name: 'Word',
    value: 'docx',
    color: chalk.blue,
  },
  {
    name: 'Html',
    value: 'html',
    color: chalk.red,
  },
  {
    name: 'Markdown',
    value: 'markdwon',
    color: chalk.cyan,
  },
]
