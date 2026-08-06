export interface Column {
  /** SQL identifier for the column. */
  name: string;
  /** Data-type declaration only; constraints belong to the dedicated flags. */
  type: string;
  /** Whether the column is part of the primary key. */
  isPrimaryKey?: boolean;
  /** Whether the column accepts NULL values. */
  isNullable?: boolean;
  /** Optional allow-listed SQL scalar or built-in default expression. */
  defaultValue?: string;
}

export interface ForeignKey {
  /** Local column participating in the relationship. */
  columnName: string;
  /** Referenced table name. */
  referenceTable: string;
  /** Referenced column name. */
  referenceColumn: string;
}

export interface Table {
  /** SQL table identifier. */
  name: string;
  /** Columns owned by the table. */
  columns: Column[];
  /** Foreign-key relationships owned by the table. */
  foreignKeys: ForeignKey[];
}

const SNAKE_CASE_IDENTIFIER = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;

function assertSnakeCaseIdentifier(kind: string, name: string): void {
  if (!SNAKE_CASE_IDENTIFIER.test(name)) {
    throw new Error(`${kind} '${name}' must be snake_case.`);
  }
}

// SQL data types cannot be bound as prepared-statement values, so this module
// accepts a deliberately small grammar instead of interpolating arbitrary text.
// A single identifier supports built-in and project-defined type names, with an
// optional numeric precision/length clause. Multi-word syntax is limited to
// well-known data-type forms rather than accepting general SQL token streams.
const SAFE_SINGLE_WORD_SQL_TYPE =
  /^[a-zA-Z][a-zA-Z0-9_]*(?:\([0-9]{1,5}(?:,\s*[0-9]{1,5})?\))?(?:\[\])?$/;
const SAFE_MULTI_WORD_SQL_TYPES = [
  /^DOUBLE\s+PRECISION$/i,
  /^(?:CHARACTER|BIT)\s+VARYING\([0-9]{1,5}\)$/i,
  /^(?:TIMESTAMP|TIME)(?:\([0-9]{1,2}\))?\s+(?:WITH|WITHOUT)\s+TIME\s+ZONE$/i,
  /^INTERVAL(?:\s+(?:YEAR|MONTH|DAY|HOUR|MINUTE|SECOND)(?:\s+TO\s+(?:MONTH|DAY|HOUR|MINUTE|SECOND))?)?$/i,
];

// Defaults are data/expression positions, but DDL generation does not have a
// parameter-binding phase. Accept scalar literals plus a short list of common,
// side-effect-free built-ins instead of arbitrary function calls.
const SAFE_SQL_DEFAULT_VALUE = /^(?:NULL|TRUE|FALSE|CURRENT_DATE|CURRENT_TIME(?:\([0-9]{1,2}\))?|CURRENT_TIMESTAMP(?:\([0-9]{1,2}\))?|LOCALTIME(?:\([0-9]{1,2}\))?|LOCALTIMESTAMP(?:\([0-9]{1,2}\))?|NOW\(\)|GEN_RANDOM_UUID\(\)|UUID_GENERATE_V4\(\)|-?(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)|'(?:''|[^'])*')$/i;

function assertSafeSQLType(type: string): void {
  const isSafe =
    SAFE_SINGLE_WORD_SQL_TYPE.test(type) ||
    SAFE_MULTI_WORD_SQL_TYPES.some((pattern) => pattern.test(type));
  if (!isSafe) {
    throw new Error(`Unsafe SQL type: '${type}'`);
  }
}

function assertSafeDefaultValue(value: string): void {
  if (!SAFE_SQL_DEFAULT_VALUE.test(value)) {
    throw new Error(`Unsafe default value: '${value}'`);
  }
}

function cloneTable(table: Table): Table {
  return {
    name: table.name,
    columns: table.columns.map((column) => ({ ...column })),
    foreignKeys: table.foreignKeys.map((foreignKey) => ({ ...foreignKey })),
  };
}

/**
 * In-memory ERD model that validates identifiers and DDL fragments before they
 * can become generated SQL. Public methods never expose mutable internal state.
 */
export class ERDModel {
  private tables: Map<string, Table> = new Map();

  /** Add an empty table and return an isolated snapshot of it. */
  addTable(name: string): Table {
    assertSnakeCaseIdentifier("Table", name);
    if (this.tables.has(name)) {
      throw new Error(`Table '${name}' already exists.`);
    }
    const table: Table = { name, columns: [], foreignKeys: [] };
    this.tables.set(name, table);
    return cloneTable(table);
  }

  /** Return an isolated snapshot of one table, or undefined when absent. */
  getTable(name: string): Table | undefined {
    const table = this.tables.get(name);
    return table ? cloneTable(table) : undefined;
  }

  /** Return isolated snapshots of all tables in insertion order. */
  getTables(): Table[] {
    return Array.from(this.tables.values()).map(cloneTable);
  }

  /**
   * Add a validated column. The accepted input is copied before storage so a
   * caller cannot mutate the object later and bypass validation.
   */
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
    table.columns.push({ ...column });
  }

  /**
   * Add a validated foreign key. The input is copied to preserve the validated
   * relationship even if the caller later mutates its source object.
   */
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
    table.foreignKeys.push({ ...fk });
  }

  /** Generate CREATE TABLE statements from the validated in-memory model. */
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
