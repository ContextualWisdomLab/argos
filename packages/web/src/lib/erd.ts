export interface Column {
  name: string
  type: string
  isPrimaryKey?: boolean
  isNullable?: boolean
  isUnique?: boolean
  defaultValue?: string
}

export interface ForeignKey {
  columnName: string
  referenceTable: string
  referenceColumn: string
}

export interface Table {
  name: string
  columns: Column[]
  foreignKeys: ForeignKey[]
}

const SNAKE_CASE_IDENTIFIER = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/
const SAFE_SQL_TYPE = /^[A-Za-z]+(?:\s+[A-Za-z]+)*(?:\([0-9]+(?:\s*,\s*[0-9]+)?\))?(?:\s+[A-Za-z]+)*$/i
const SAFE_SQL_DEFAULT_VALUE = /^(?:'[^']*'|-?[0-9]+(?:\.[0-9]+)?|true|false|TRUE|FALSE|NULL|[A-Za-z_][A-Za-z0-9_]*(?:\(\))?)$/i

function assertSnakeCaseIdentifier(kind: string, name: string): void {
  if (!SNAKE_CASE_IDENTIFIER.test(name)) {
    throw new Error(`${kind} '${name}' must be snake_case.`)
  }
}

function assertSafeSQLType(type: string): void {
  if (!SAFE_SQL_TYPE.test(type)) {
    throw new Error(`Invalid SQL type '${type}'. Only alphanumeric characters and optional size/precision parentheses are allowed.`)
  }
}

function assertSafeDefaultValue(defaultValue: string | undefined): void {
  if (defaultValue !== undefined && !SAFE_SQL_DEFAULT_VALUE.test(defaultValue)) {
    throw new Error(`Invalid SQL default value '${defaultValue}'. Only simple literals (string, number, boolean, NULL) are allowed.`)
  }
}

export class ERDModel {
  private tables: Map<string, Table> = new Map()

  addTable(name: string): Table {
    assertSnakeCaseIdentifier('Table', name)
    if (this.tables.has(name)) {
      throw new Error(`Table '${name}' already exists.`)
    }
    const table: Table = { name, columns: [], foreignKeys: [] }
    this.tables.set(name, table)
    return table
  }

  removeTable(name: string): void {
    if (!this.tables.has(name)) {
      throw new Error(`Table '${name}' does not exist.`)
    }
    // 다른 테이블에서 이 테이블을 참조하고 있는지 확인
    for (const table of this.tables.values()) {
      if (table.name !== name) {
        for (const fk of table.foreignKeys) {
          if (fk.referenceTable === name) {
            throw new Error(`Cannot remove table '${name}' because table '${table.name}' references it.`)
          }
        }
      }
    }
    this.tables.delete(name)
  }

  getTable(name: string): Table | undefined {
    return this.tables.get(name)
  }

  getTables(): Table[] {
    return Array.from(this.tables.values())
  }

  addColumn(tableName: string, column: Column): void {
    assertSnakeCaseIdentifier('Table', tableName)
    assertSnakeCaseIdentifier('Column', column.name)
    assertSafeSQLType(column.type)
    assertSafeDefaultValue(column.defaultValue)
    const table = this.tables.get(tableName)
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`)
    }
    if (table.columns.some((c) => c.name === column.name)) {
      throw new Error(`Column '${column.name}' already exists in table '${tableName}'.`)
    }
    table.columns.push(column)
  }

  removeColumn(tableName: string, columnName: string): void {
    const table = this.tables.get(tableName)
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`)
    }
    const columnIndex = table.columns.findIndex((c) => c.name === columnName)
    if (columnIndex === -1) {
      throw new Error(`Column '${columnName}' does not exist in table '${tableName}'.`)
    }

    // 다른 테이블에서 이 컬럼을 참조하고 있는지 확인
    for (const t of this.tables.values()) {
      for (const fk of t.foreignKeys) {
        if (fk.referenceTable === tableName && fk.referenceColumn === columnName) {
          throw new Error(`Cannot remove column '${columnName}' because table '${t.name}' references it.`)
        }
      }
    }

    // 자기 자신의 외래키 중 해당 컬럼을 사용하는 항목 자동 정리
    table.foreignKeys = table.foreignKeys.filter((fk) => fk.columnName !== columnName)
    table.columns.splice(columnIndex, 1)
  }

  addForeignKey(tableName: string, fk: ForeignKey): void {
    assertSnakeCaseIdentifier('Table', tableName)
    assertSnakeCaseIdentifier('Column', fk.columnName)
    assertSnakeCaseIdentifier('Reference table', fk.referenceTable)
    assertSnakeCaseIdentifier('Reference column', fk.referenceColumn)
    const table = this.tables.get(tableName)
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`)
    }
    if (!table.columns.some((c) => c.name === fk.columnName)) {
      throw new Error(`Column '${fk.columnName}' does not exist in table '${tableName}'.`)
    }
    const refTable = this.tables.get(fk.referenceTable)
    if (!refTable) {
      throw new Error(`Reference table '${fk.referenceTable}' does not exist.`)
    }
    if (!refTable.columns.some((c) => c.name === fk.referenceColumn)) {
      throw new Error(
        `Reference column '${fk.referenceColumn}' does not exist in table '${fk.referenceTable}'.`
      )
    }
    table.foreignKeys.push(fk)
  }

  generateDDL(): string {
    let ddl = ''
    for (const table of this.tables.values()) {
      ddl += `CREATE TABLE ${table.name} (\n`
      const columnDefs = table.columns.map((col) => {
        let def = `  ${col.name} ${col.type}`
        if (col.isPrimaryKey) {
          def += ' PRIMARY KEY'
        }
        if (col.isNullable === false) {
          def += ' NOT NULL'
        }
        if (col.isUnique) {
          def += ' UNIQUE'
        }
        if (col.defaultValue !== undefined) {
          def += ` DEFAULT ${col.defaultValue}`
        }
        return def
      })

      const fkDefs = table.foreignKeys.map((fk) => {
        return `  FOREIGN KEY (${fk.columnName}) REFERENCES ${fk.referenceTable}(${fk.referenceColumn})`
      })

      const allDefs = [...columnDefs, ...fkDefs]
      ddl += allDefs.join(',\n')
      ddl += '\n);\n\n'
    }
    return ddl.trim()
  }
}
