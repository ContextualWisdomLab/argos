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

export interface Index {
  name: string
  columns: string[]
  isUnique?: boolean
}

export interface Table {
  name: string
  columns: Column[]
  foreignKeys: ForeignKey[]
  indices: Index[]
}

const SNAKE_CASE_IDENTIFIER = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/

function assertSnakeCaseIdentifier(kind: string, name: string): void {
  if (!SNAKE_CASE_IDENTIFIER.test(name)) {
    throw new Error(`${kind} '${name}' must be snake_case.`)
  }
}

function assertNoStatementTerminator(value: string): void {
  if (value.includes(';')) {
    throw new Error(`SQL injection prevention: Statement terminators (;) are not allowed.`)
  }
}

export class ERDModel {
  private tables: Map<string, Table> = new Map()

  addTable(name: string): Table {
    assertSnakeCaseIdentifier('Table', name)
    if (this.tables.has(name)) {
      throw new Error(`Table '${name}' already exists.`)
    }
    const table: Table = { name, columns: [], foreignKeys: [], indices: [] }
    this.tables.set(name, table)
    return table
  }

  updateTable(oldName: string, newName: string): Table {
    assertSnakeCaseIdentifier('Table', newName)
    const table = this.tables.get(oldName)
    if (!table) {
      throw new Error(`Table '${oldName}' does not exist.`)
    }
    if (oldName !== newName && this.tables.has(newName)) {
      throw new Error(`Table '${newName}' already exists.`)
    }
    table.name = newName

    // Update references in foreign keys of other tables
    for (const t of this.tables.values()) {
      for (const fk of t.foreignKeys) {
        if (fk.referenceTable === oldName) {
          fk.referenceTable = newName
        }
      }
    }

    if (oldName !== newName) {
      this.tables.delete(oldName)
      this.tables.set(newName, table)
    }

    return table
  }

  removeTable(name: string): void {
    if (!this.tables.has(name)) {
      throw new Error(`Table '${name}' does not exist.`)
    }

    // Check if other tables reference this table
    for (const table of this.tables.values()) {
      if (table.name !== name) {
        if (table.foreignKeys.some(fk => fk.referenceTable === name)) {
          throw new Error(`Cannot remove table '${name}' as it is referenced by '${table.name}'.`)
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
    assertNoStatementTerminator(column.type)
    const table = this.tables.get(tableName)
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`)
    }
    if (table.columns.some((c) => c.name === column.name)) {
      throw new Error(`Column '${column.name}' already exists in table '${tableName}'.`)
    }
    table.columns.push(column)
  }

  updateColumn(tableName: string, columnName: string, newColumn: Column): void {
    assertSnakeCaseIdentifier('Table', tableName)
    assertSnakeCaseIdentifier('Column', newColumn.name)
    assertNoStatementTerminator(newColumn.type)
    const table = this.tables.get(tableName)
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`)
    }
    const index = table.columns.findIndex(c => c.name === columnName)
    if (index === -1) {
      throw new Error(`Column '${columnName}' does not exist in table '${tableName}'.`)
    }
    if (columnName !== newColumn.name && table.columns.some((c) => c.name === newColumn.name)) {
      throw new Error(`Column '${newColumn.name}' already exists in table '${tableName}'.`)
    }

    // Update references in foreign keys of this table and other tables
    if (columnName !== newColumn.name) {
      for (const fk of table.foreignKeys) {
        if (fk.columnName === columnName) {
          fk.columnName = newColumn.name
        }
      }
      for (const t of this.tables.values()) {
        for (const fk of t.foreignKeys) {
          if (fk.referenceTable === tableName && fk.referenceColumn === columnName) {
            fk.referenceColumn = newColumn.name
          }
        }
      }
      for (const idx of table.indices) {
        idx.columns = idx.columns.map(c => c === columnName ? newColumn.name : c)
      }
    }

    table.columns[index] = newColumn
  }

  removeColumn(tableName: string, columnName: string): void {
    const table = this.tables.get(tableName)
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`)
    }
    const index = table.columns.findIndex(c => c.name === columnName)
    if (index === -1) {
      throw new Error(`Column '${columnName}' does not exist in table '${tableName}'.`)
    }

    // Check if column is referenced by foreign keys
    if (table.foreignKeys.some(fk => fk.columnName === columnName)) {
      throw new Error(`Cannot remove column '${columnName}' as it is part of a foreign key.`)
    }

    for (const t of this.tables.values()) {
      if (t.foreignKeys.some(fk => fk.referenceTable === tableName && fk.referenceColumn === columnName)) {
        throw new Error(`Cannot remove column '${columnName}' as it is referenced by a foreign key in table '${t.name}'.`)
      }
    }

    // Remove from indices
    for (const idx of table.indices) {
      if (idx.columns.includes(columnName)) {
        throw new Error(`Cannot remove column '${columnName}' as it is part of index '${idx.name}'.`)
      }
    }

    table.columns.splice(index, 1)
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

  removeForeignKey(tableName: string, columnName: string, referenceTable: string, referenceColumn: string): void {
    const table = this.tables.get(tableName)
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`)
    }

    const index = table.foreignKeys.findIndex(fk =>
      fk.columnName === columnName &&
      fk.referenceTable === referenceTable &&
      fk.referenceColumn === referenceColumn
    )

    if (index === -1) {
      throw new Error(`Foreign key does not exist.`)
    }

    table.foreignKeys.splice(index, 1)
  }

  addIndex(tableName: string, index: Index): void {
    assertSnakeCaseIdentifier('Table', tableName)
    assertSnakeCaseIdentifier('Index', index.name)
    const table = this.tables.get(tableName)
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`)
    }
    if (table.indices.some(i => i.name === index.name)) {
      throw new Error(`Index '${index.name}' already exists in table '${tableName}'.`)
    }
    for (const col of index.columns) {
      if (!table.columns.some(c => c.name === col)) {
        throw new Error(`Column '${col}' does not exist in table '${tableName}'.`)
      }
    }
    table.indices.push(index)
  }

  removeIndex(tableName: string, indexName: string): void {
    const table = this.tables.get(tableName)
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`)
    }
    const idxIndex = table.indices.findIndex(i => i.name === indexName)
    if (idxIndex === -1) {
      throw new Error(`Index '${indexName}' does not exist in table '${tableName}'.`)
    }
    table.indices.splice(idxIndex, 1)
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

      for (const idx of table.indices) {
        const uniqueStr = idx.isUnique ? 'UNIQUE ' : ''
        ddl += `CREATE ${uniqueStr}INDEX ${idx.name} ON ${table.name} (${idx.columns.join(', ')});\n\n`
      }
    }
    return ddl.trim()
  }

  generateMermaid(): string {
    let mermaid = 'erDiagram\n'
    for (const table of this.tables.values()) {
      mermaid += `  ${table.name} {\n`
      for (const col of table.columns) {
        let keyMarker = ''
        if (col.isPrimaryKey) {
          keyMarker = ' PK'
        } else if (table.foreignKeys.some(fk => fk.columnName === col.name)) {
          keyMarker = ' FK'
        }
        // Simplified mapping for mermaid visualization
        mermaid += `    ${col.type.split('(')[0]} ${col.name}${keyMarker}\n`
      }
      mermaid += `  }\n`
    }

    // Add relationships
    for (const table of this.tables.values()) {
      for (const fk of table.foreignKeys) {
        // Many-to-one relationship representation in mermaid ERD
        mermaid += `  ${table.name} }o--|| ${fk.referenceTable} : "${fk.columnName} -> ${fk.referenceColumn}"\n`
      }
    }

    return mermaid.trim()
  }
}
