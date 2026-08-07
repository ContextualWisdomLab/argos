export interface Column {
  name: string
  type: string
  isPrimaryKey?: boolean
  isNullable?: boolean
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
const SAFE_SQL_TYPE = /^[A-Za-z][A-Za-z0-9_]*(?:\s+[A-Za-z][A-Za-z0-9_]*)*(?:\(\s*\d+(?:\s*,\s*\d+)?\s*\))?(?:\[\])?$/

function assertSnakeCaseIdentifier(kind: string, name: string): void {
  if (!SNAKE_CASE_IDENTIFIER.test(name)) {
    throw new Error(`${kind} '${name}' must be snake_case.`)
  }
}

/**
 * Reject SQL type fragments that can escape a column definition.
 *
 * The accepted grammar intentionally covers common scalar SQL types, optional
 * numeric parameters such as `numeric(10,2)`, multi-word types such as
 * `timestamp with time zone`, and array suffixes. It rejects statement
 * terminators, comments, top-level commas, quotes, operators, and unbalanced
 * parentheses so untrusted type text cannot introduce sibling DDL clauses.
 */
function assertValidSqlType(type: string): void {
  if (!SAFE_SQL_TYPE.test(type)) {
    throw new Error(`Invalid SQL type '${type}'.`)
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

  getTable(name: string): Table | undefined {
    return this.tables.get(name)
  }

  getTables(): Table[] {
    return Array.from(this.tables.values())
  }

  addColumn(tableName: string, column: Column): void {
    assertSnakeCaseIdentifier('Table', tableName)
    assertSnakeCaseIdentifier('Column', column.name)
    assertValidSqlType(column.type)
    const table = this.tables.get(tableName)
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`)
    }
    if (table.columns.some((c) => c.name === column.name)) {
      throw new Error(`Column '${column.name}' already exists in table '${tableName}'.`)
    }
    table.columns.push(column)
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
