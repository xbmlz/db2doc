import inquirer from 'inquirer'
import figlet from 'figlet'
import { DIALECTS, DOC_TYPES } from './data'
import Database from './db'
import { generateDoc } from './doc/doc'
import type { DocType } from './types'

figlet('db2doc', async (err, result) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(result)

  // dialect
  const { dialect } = await inquirer.prompt<{ dialect: string }>({
    name: 'dialect',
    type: 'list',
    message: 'Select a dialect:',
    choices: DIALECTS.map((dialect) => {
      const dialectColor = dialect.color
      return {
        name: dialectColor(dialect.name),
        value: dialect.value,
      }
    }),
  })

  // host
  const { host } = await inquirer.prompt<{ host: string }>({
    name: 'host',
    type: 'input',
    message: 'Enter host:',
    default: 'rm-8vb553159t6r76u6ujo.mysql.zhangbei.rds.aliyuncs.com',
  })

  // port
  const { port } = await inquirer.prompt<{ port: number }>({
    name: 'port',
    type: 'number',
    message: 'Enter port:',
    default: DIALECTS.find((d) => d.value === dialect)?.port,
  })

  // user and password
  const { user, password } = await inquirer.prompt<{
    user: string
    password: string
  }>([
    {
      name: 'user',
      type: 'input',
      message: 'Enter user:',
      default: DIALECTS.find((d) => d.value === dialect)?.user,
    },
    {
      name: 'password',
      type: 'input',
      message: 'Enter password:',
      default: 'Cxc170016',
    },
  ])

  // database
  const db = new Database({ dialect, host, port, user, password })
  const dbs = await db.getDbs()
  const { database } = await inquirer.prompt<{ database: string }>({
    name: 'database',
    type: 'list',
    message: 'Select a database:',
    choices: dbs,
  })

  // doc type
  const { docType } = await inquirer.prompt<{ docType: DocType }>({
    name: 'docType',
    type: 'list',
    message: 'Select a doc type:',
    choices: DOC_TYPES.map((doc) => {
      const docColor = doc.color
      return {
        name: docColor(doc.name),
        value: doc.value,
      }
    }),
  })

  const dbInfo = await db.getDbInfo(database)

  generateDoc(docType, dbInfo)
  // console.log(dbs)
  // const opts = await inquirer.prompt(prompts)
  // console.log(dialect, host, port, user, password, database, docMode, docFmt)
  // generateDoc(opts as unknown as DbOptions)
  // console.log(docFmt)
  // process.exit(0)
})
