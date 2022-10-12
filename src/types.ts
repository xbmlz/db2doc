export type docType = 'docsify' | 'markdwon' | 'html' | 'docx' | 'excel' | 'pdf'

export type ColorFunc = (str: string | number) => string

export interface DocType {
  name: string
  value: string
  mode: string
  color: ColorFunc
}

export interface DbDialect {
  name: string
  value: string
  port: number
  user: string
  color: ColorFunc
}

export interface ConnOptions {
  dialect: string
  host: string
  port: number
  user: string
  password: string
}

export interface ColumnInfo {
  orderNum: number
  name: string
  comment: string
  dataType: string
  length: number | string
  scale: number | string
  isIdentity: boolean | string
  isPK: boolean | string
  isNullable: boolean | string
  defaultVal: string
}

export interface TableInfo {
  name: string
  comment: string
  columns: ColumnInfo[]
}

export interface DbInfo {
  name: string
  dialect: string
  version: string
  charset: string
  collation: string
  tables: TableInfo[]
}
