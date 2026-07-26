export interface Column {
  name: string
  type: string
  isPrimaryKey?: boolean
  isNullable?: boolean
  isUnique?: boolean
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

function assertSnakeCaseIdentifier(kind: string, name: string): void {
  if (!SNAKE_CASE_IDENTIFIER.test(name)) {
    throw new Error(`${kind} '${name}' must be snake_case.`)
  }
}

function assertSafeSqlType(type: string): void {
  if (type.includes(';')) {
    throw new Error(`SQL type '${type}' contains invalid characters (;)`)
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
    assertSafeSqlType(column.type)
    const table = this.tables.get(tableName)
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`)
    }
    if (table.columns.some((c) => c.name === column.name)) {
      throw new Error(`Column '${column.name}' already exists in table '${tableName}'.`)
    }
    table.columns.push(column)
  }

  removeTable(name: string): void {
    assertSnakeCaseIdentifier('Table', name)
    if (!this.tables.has(name)) {
      throw new Error(`Table '${name}' does not exist.`)
    }

    // Remove foreign keys in other tables that reference this table
    for (const table of this.tables.values()) {
      table.foreignKeys = table.foreignKeys.filter(
        (fk) => fk.referenceTable !== name
      )
    }

    this.tables.delete(name)
  }

  removeColumn(tableName: string, columnName: string): void {
    assertSnakeCaseIdentifier('Table', tableName)
    assertSnakeCaseIdentifier('Column', columnName)
    const table = this.tables.get(tableName)
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`)
    }
    const columnIndex = table.columns.findIndex((c) => c.name === columnName)
    if (columnIndex === -1) {
      throw new Error(`Column '${columnName}' does not exist in table '${tableName}'.`)
    }

    // Remove the column
    table.columns.splice(columnIndex, 1)

    // Remove foreign keys originating from this column in this table
    table.foreignKeys = table.foreignKeys.filter(
      (fk) => fk.columnName !== columnName
    )

    // Remove foreign keys in other tables referencing this column
    for (const t of this.tables.values()) {
      t.foreignKeys = t.foreignKeys.filter(
        (fk) => !(fk.referenceTable === tableName && fk.referenceColumn === columnName)
      )
    }
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
        if (col.isUnique) {
          def += ' UNIQUE'
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
