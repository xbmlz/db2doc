import { Sequelize } from 'sequelize'
import type { ColumnInfo, ConnOptions, DbInfo, TableInfo } from './types'

export default class Database {
  private opts: ConnOptions

  private sequelize: Sequelize

  constructor(opts: ConnOptions) {
    this.opts = opts
    this.sequelize = new Sequelize(
      `${opts.dialect}://${opts.user}:${opts.password}@${opts.host}:${opts.port}`,
      {
        logging: false,
      }
    )
  }

  private async getVersion() {
    let sql = ''
    if (this.opts.dialect === 'mysql') {
      sql = 'select @@version as version;'
    }
    const result = await this.sequelize.query(sql, { plain: true })
    return result?.version as string
  }

  private async getCharset() {
    let sql = ''
    if (this.opts.dialect === 'mysql') {
      sql = 'show variables like "%character_set_server%";'
    }
    const result = await this.sequelize.query(sql, { plain: true })
    return result?.Value as string
  }

  private async getCollation() {
    let sql = ''
    if (this.opts.dialect === 'mysql') {
      sql = 'show variables like "collation_server%";'
    }
    const result = await this.sequelize.query(sql, { plain: true })
    return result?.Value as string
  }

  public async getDbs() {
    let sql = ''
    let dbs = []
    if (this.opts.dialect === 'mysql') {
      sql = 'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA order by SCHEMA_NAME asc'
    }
    const [results] = await this.sequelize.query(sql)
    for (const res in results) {
      // @ts-expect-error raw query
      dbs.push(results[res]?.SCHEMA_NAME)
    }
    dbs = dbs.filter((db) => db !== '__recycle_bin__')
    return dbs
  }

  private async getTables(dbName: string) {
    let sql = ''
    if (this.opts.dialect === 'mysql') {
      sql =
        'SELECT table_name name, TABLE_COMMENT comment FROM INFORMATION_SCHEMA.TABLES WHERE lower(table_type)="base table" and table_schema = ? order by table_name asc'
    }
    const [results] = await this.sequelize.query(sql, {
      replacements: [dbName],
    })
    return results as unknown as TableInfo[]
  }

  private async getColumns(dbName: string, tableName: string) {
    let sql = ''
    if (this.opts.dialect === 'mysql') {
      sql = `
        SELECT
          ORDINAL_POSITION AS orderNum,
          Column_Name AS name,
          data_type AS dataType,
          COLUMN_COMMENT AS comment,
          ( CASE WHEN data_type = 'float' OR data_type = 'double' OR data_type = 'decimal' THEN NUMERIC_PRECISION ELSE CHARACTER_MAXIMUM_LENGTH END ) AS length,
          ( CASE WHEN data_type = 'int' OR data_type = 'bigint' THEN NULL ELSE NUMERIC_SCALE END ) AS scale,
          ( CASE WHEN EXTRA = 'auto_increment' THEN 1 ELSE 0 END ) AS isIdentity,
          ( CASE WHEN COLUMN_KEY = 'PRI' THEN 1 ELSE 0 END ) AS isPK,
          ( CASE WHEN IS_NULLABLE = 'NO' THEN 0 ELSE 1 END ) AS isNullable,
          COLUMN_DEFAULT AS defaultVal FROM information_schema.COLUMNS
        WHERE table_schema = ? AND table_name = ?
        ORDER BY ORDINAL_POSITION ASC;
      `
    }
    const [results] = await this.sequelize.query(sql, {
      replacements: [dbName, tableName],
    })
    const columns = results as unknown as ColumnInfo[]
    for (const i in columns) {
      columns[i].length = columns[i].length === null ? '' : columns[i].length
      columns[i].scale = columns[i].scale === null ? '' : columns[i].scale
      columns[i].isPK = columns[i].isPK ? 'PK' : ''
      columns[i].isIdentity = columns[i].isIdentity ? 'Y' : ''
      columns[i].isNullable = columns[i].isNullable ? 'Y' : 'N'
      columns[i].defaultVal = columns[i].defaultVal === null ? '' : columns[i].defaultVal
    }

    return columns
  }

  public async getDbInfo(name: string): Promise<DbInfo> {
    const dialect = this.opts.dialect
    const version = await this.getVersion()
    const charset = await this.getCharset()
    const collation = await this.getCollation()
    // const dbs = await this.getDbs()
    // eslint-disable-next-line prefer-const
    let tables = await this.getTables(name)
    for (const i in tables) {
      const cols = await this.getColumns(name, tables[i].name)
      tables[i].columns = cols
    }

    return {
      name,
      dialect,
      version,
      charset,
      collation,
      tables,
    }
  }
}
