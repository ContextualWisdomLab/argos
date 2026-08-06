export interface Column {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isNullable?: boolean;
  defaultValue?: string;
}

export interface ForeignKey {
  columnName: string;
  referenceTable: string;
  referenceColumn: string;
}

export interface Table {
  name: string;
  columns: Column[];
  foreignKeys: ForeignKey[];
}

const SNAKE_CASE_IDENTIFIER = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;

function assertSnakeCaseIdentifier(kind: string, name: string): void {
  if (!SNAKE_CASE_IDENTIFIER.test(name)) {
    throw new Error(`${kind} '${name}' must be snake_case.`);
  }
}

const SAFE_SQL_TYPE =
  /^[a-zA-Z0-9_]+(?:\([0-9]+(?:,\s*[0-9]+)?\))?(?:\s+[a-zA-Z0-9_]+)*$/;
const SAFE_SQL_DEFAULT_VALUE =
  /^([a-zA-Z0-9_]+(?:\(\))?|'[^']*'|-?[0-9]+(?:\.[0-9]+)?)$/;

function assertSafeSQLType(type: string): void {
  if (!SAFE_SQL_TYPE.test(type)) {
    throw new Error(`Unsafe SQL type: '${type}'`);
  }
}

function assertSafeDefaultValue(value: string): void {
  if (!SAFE_SQL_DEFAULT_VALUE.test(value)) {
    throw new Error(`Unsafe default value: '${value}'`);
  }
}

export class ERDModel {
  private tables: Map<string, Table> = new Map();

  addTable(name: string): Table {
    assertSnakeCaseIdentifier("Table", name);
    if (this.tables.has(name)) {
      throw new Error(`Table '${name}' already exists.`);
    }
    const table: Table = { name, columns: [], foreignKeys: [] };
    this.tables.set(name, table);
    return JSON.parse(JSON.stringify(table));
  }

  getTable(name: string): Table | undefined {
    const table = this.tables.get(name);
    return table ? JSON.parse(JSON.stringify(table)) : undefined;
  }

  getTables(): Table[] {
    return Array.from(this.tables.values()).map((table) =>
      JSON.parse(JSON.stringify(table)),
    );
  }

  addColumn(tableName: string, column: Column): void {
    assertSnakeCaseIdentifier("Table", tableName);
    assertSnakeCaseIdentifier("Column", column.name);
    assertSafeSQLType(column.type);
    if (column.defaultValue !== undefined) {
      assertSafeDefaultValue(column.defaultValue);
    }
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`);
    }
    if (table.columns.some((c) => c.name === column.name)) {
      throw new Error(
        `Column '${column.name}' already exists in table '${tableName}'.`,
      );
    }
    table.columns.push(column);
  }

  addForeignKey(tableName: string, fk: ForeignKey): void {
    assertSnakeCaseIdentifier("Table", tableName);
    assertSnakeCaseIdentifier("Column", fk.columnName);
    assertSnakeCaseIdentifier("Reference table", fk.referenceTable);
    assertSnakeCaseIdentifier("Reference column", fk.referenceColumn);
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`);
    }
    if (!table.columns.some((c) => c.name === fk.columnName)) {
      throw new Error(
        `Column '${fk.columnName}' does not exist in table '${tableName}'.`,
      );
    }
    const refTable = this.tables.get(fk.referenceTable);
    if (!refTable) {
      throw new Error(`Reference table '${fk.referenceTable}' does not exist.`);
    }
    if (!refTable.columns.some((c) => c.name === fk.referenceColumn)) {
      throw new Error(
        `Reference column '${fk.referenceColumn}' does not exist in table '${fk.referenceTable}'.`,
      );
    }
    table.foreignKeys.push(fk);
  }

  generateDDL(): string {
    let ddl = "";
    for (const table of this.tables.values()) {
      ddl += `CREATE TABLE ${table.name} (\n`;
      const columnDefs = table.columns.map((col) => {
        let def = `  ${col.name} ${col.type}`;
        if (col.isPrimaryKey) {
          def += " PRIMARY KEY";
        }
        if (col.isNullable === false) {
          def += " NOT NULL";
        }
        if (col.defaultValue !== undefined) {
          def += ` DEFAULT ${col.defaultValue}`;
        }
        return def;
      });

      const fkDefs = table.foreignKeys.map((fk) => {
        return `  FOREIGN KEY (${fk.columnName}) REFERENCES ${fk.referenceTable}(${fk.referenceColumn})`;
      });

      const allDefs = [...columnDefs, ...fkDefs];
      ddl += allDefs.join(",\n");
      ddl += "\n);\n\n";
    }
    return ddl.trim();
  }
}
