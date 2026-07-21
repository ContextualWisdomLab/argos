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

function assertSnakeCaseIdentifier(kind: string, name: string): void {
  if (!SNAKE_CASE_IDENTIFIER.test(name)) {
    throw new Error(`${kind} '${name}' must be snake_case.`)
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

  removeTable(name: string): void {
    const table = this.tables.get(name)
    if (!table) {
      throw new Error(`Table '${name}' does not exist.`)
    }
    // Cannot remove if referenced by another table
    for (const t of this.tables.values()) {
      for (const fk of t.foreignKeys) {
        if (fk.referenceTable === name) {
          throw new Error(`Cannot remove table '${name}' because it is referenced by '${t.name}'.`)
        }
      }
    }
    this.tables.delete(name)
  }

  removeColumn(tableName: string, columnName: string): void {
    const table = this.tables.get(tableName)
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`)
    }
    const columnIdx = table.columns.findIndex((c) => c.name === columnName)
    if (columnIdx === -1) {
      throw new Error(`Column '${columnName}' does not exist in table '${tableName}'.`)
    }

    // Cannot remove if used in a foreign key
    if (table.foreignKeys.some((fk) => fk.columnName === columnName)) {
      throw new Error(`Cannot remove column '${columnName}' because it is used in a foreign key.`)
    }

    // Cannot remove if referenced by another table
    for (const t of this.tables.values()) {
      for (const fk of t.foreignKeys) {
        if (fk.referenceTable === tableName && fk.referenceColumn === columnName) {
          throw new Error(`Cannot remove column '${columnName}' because it is referenced by '${t.name}'.`)
        }
      }
    }

    table.columns.splice(columnIdx, 1)
  }

  removeForeignKey(tableName: string, columnName: string, referenceTable: string, referenceColumn: string): void {
    const table = this.tables.get(tableName)
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`)
    }
    const fkIdx = table.foreignKeys.findIndex(
      (fk) => fk.columnName === columnName && fk.referenceTable === referenceTable && fk.referenceColumn === referenceColumn
    )
    if (fkIdx === -1) {
      throw new Error(`Foreign key not found.`)
    }
    table.foreignKeys.splice(fkIdx, 1)
  }

  generateMermaid(): string {
    let mermaid = 'erDiagram\n'

    for (const table of this.tables.values()) {
      mermaid += `  ${table.name} {\n`
      for (const col of table.columns) {
        let pkFk = ''
        if (col.isPrimaryKey) pkFk = ' PK'
        // also check if this column is part of a foreign key
        if (table.foreignKeys.some((fk) => fk.columnName === col.name)) {
          pkFk += ' FK'
        }
        mermaid += `    ${col.type} ${col.name}${pkFk.trim() ? ' ' + pkFk.trim() : ''}\n`
      }
      mermaid += `  }\n`
    }

    // Add relationships
    for (const table of this.tables.values()) {
      for (const fk of table.foreignKeys) {
        mermaid += `  ${table.name} ||--o{ ${fk.referenceTable} : "${fk.columnName} references ${fk.referenceColumn}"\n`
      }
    }

    return mermaid.trim()
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
