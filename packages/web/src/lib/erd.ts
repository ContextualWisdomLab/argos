export interface Column {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isNullable?: boolean;
  isUnique?: boolean;
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
const SIMPLE_SQL_TYPE = /^[a-zA-Z][a-zA-Z0-9_]*$/;
const PARAMETERIZED_SQL_TYPE =
  /^[a-zA-Z][a-zA-Z0-9_]*\((?:MAX|[0-9]+)(?:, [0-9]+)?\)$/i;
const MULTI_WORD_SQL_TYPE =
  /^(?:DOUBLE PRECISION|CHARACTER VARYING(?:\((?:MAX|[0-9]+)\))?|(?:TIME|TIMESTAMP)(?:\([0-9]+\))? (?:WITH|WITHOUT) TIME ZONE)$/i;
const MAX_SQL_TYPE_LENGTH = 128;
const MAX_DEFAULT_VALUE_LENGTH = 255;
const SAFE_SQL_DEFAULT_VALUE =
  /^('(?:[^']|'')*')$|^(?:-?[0-9]+(?:\.[0-9]+)?)$|^(?:TRUE|FALSE|CURRENT_TIMESTAMP|CURRENT_DATE|NULL)$/i;

function assertSafeSqlType(type: string): void {
  const isCanonicalWhitespace =
    type === type.trim() && !/[\t\r\n\f\v]/.test(type);
  const matchesSafeGrammar =
    SIMPLE_SQL_TYPE.test(type) ||
    PARAMETERIZED_SQL_TYPE.test(type) ||
    MULTI_WORD_SQL_TYPE.test(type);

  if (
    type.length === 0 ||
    type.length > MAX_SQL_TYPE_LENGTH ||
    !isCanonicalWhitespace ||
    !matchesSafeGrammar
  ) {
    throw new Error(`Invalid SQL type: '${type}'`);
  }
}

function assertSafeSqlDefaultValue(value: string): void {
  const isCanonicalWhitespace =
    value === value.trim() && !/[\t\r\n\f\v]/.test(value);

  if (
    value.length === 0 ||
    value.length > MAX_DEFAULT_VALUE_LENGTH ||
    !isCanonicalWhitespace ||
    !SAFE_SQL_DEFAULT_VALUE.test(value)
  ) {
    throw new Error(`Invalid SQL default value: '${value}'`);
  }
}

function assertSnakeCaseIdentifier(kind: string, name: string): void {
  if (!SNAKE_CASE_IDENTIFIER.test(name)) {
    throw new Error(`${kind} '${name}' must be snake_case.`);
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
    return structuredClone(table);
  }

  getTable(name: string): Table | undefined {
    const table = this.tables.get(name);
    return table ? structuredClone(table) : undefined;
  }

  getTables(): Table[] {
    return Array.from(this.tables.values()).map((t) => structuredClone(t));
  }

  removeTable(name: string): void {
    assertSnakeCaseIdentifier("Table", name);
    if (!this.tables.has(name)) {
      throw new Error(`Table '${name}' does not exist.`);
    }
    for (const table of this.tables.values()) {
      if (
        table.name !== name &&
        table.foreignKeys.some((fk) => fk.referenceTable === name)
      ) {
        throw new Error(
          `Cannot remove table '${name}' because it is referenced by table '${table.name}'.`,
        );
      }
    }
    this.tables.delete(name);
  }

  addColumn(tableName: string, column: Column): void {
    assertSnakeCaseIdentifier("Table", tableName);
    assertSnakeCaseIdentifier("Column", column.name);
    assertSafeSqlType(column.type);
    if (column.defaultValue !== undefined) {
      assertSafeSqlDefaultValue(column.defaultValue);
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
    table.columns.push(structuredClone(column));
  }

  removeColumn(tableName: string, columnName: string): void {
    assertSnakeCaseIdentifier("Table", tableName);
    assertSnakeCaseIdentifier("Column", columnName);
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`);
    }
    const colIndex = table.columns.findIndex((c) => c.name === columnName);
    if (colIndex === -1) {
      throw new Error(
        `Column '${columnName}' does not exist in table '${tableName}'.`,
      );
    }
    if (table.foreignKeys.some((fk) => fk.columnName === columnName)) {
      throw new Error(
        `Cannot remove column '${columnName}' because it is used in a foreign key.`,
      );
    }
    for (const t of this.tables.values()) {
      if (
        t.foreignKeys.some(
          (fk) =>
            fk.referenceTable === tableName &&
            fk.referenceColumn === columnName,
        )
      ) {
        throw new Error(
          `Cannot remove column '${columnName}' because it is referenced by table '${t.name}'.`,
        );
      }
    }
    table.columns.splice(colIndex, 1);
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
    table.foreignKeys.push(structuredClone(fk));
  }

  removeForeignKey(tableName: string, columnName: string): void {
    assertSnakeCaseIdentifier("Table", tableName);
    assertSnakeCaseIdentifier("Column", columnName);
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`);
    }
    const fkIndex = table.foreignKeys.findIndex(
      (fk) => fk.columnName === columnName,
    );
    if (fkIndex === -1) {
      throw new Error(
        `Foreign key for column '${columnName}' does not exist in table '${tableName}'.`,
      );
    }
    table.foreignKeys.splice(fkIndex, 1);
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
        if (col.isUnique) {
          def += " UNIQUE";
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
