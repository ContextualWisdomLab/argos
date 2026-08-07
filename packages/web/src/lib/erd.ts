/**
 * One validated relational column stored by {@link ERDModel}.
 *
 * The `type` and optional `defaultValue` fields are SQL grammar fragments, so
 * callers must add columns through {@link ERDModel.addColumn}. That method
 * validates both fragments before copying them into model-owned state.
 */
export interface Column {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isNullable?: boolean;
  defaultValue?: string;
}

/** A validated foreign-key relationship between two model-owned columns. */
export interface ForeignKey {
  columnName: string;
  referenceTable: string;
  referenceColumn: string;
}

/** A plain-data snapshot of one table in the ERD model. */
export interface Table {
  name: string;
  columns: Column[];
  foreignKeys: ForeignKey[];
}

const SNAKE_CASE_IDENTIFIER = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;

const SIMPLE_SQL_TYPES = new Set([
  "BIGINT",
  "BIGSERIAL",
  "BOOLEAN",
  "BYTEA",
  "DATE",
  "INT",
  "INTEGER",
  "JSON",
  "JSONB",
  "REAL",
  "SERIAL",
  "SMALLINT",
  "TEXT",
  "TIME",
  "TIMESTAMP",
  "UUID",
]);

const MULTI_WORD_SQL_TYPES = new Set([
  "DOUBLE PRECISION",
  "TIME WITH TIME ZONE",
  "TIME WITHOUT TIME ZONE",
  "TIMESTAMP WITH TIME ZONE",
  "TIMESTAMP WITHOUT TIME ZONE",
]);

const PARAMETERIZED_SQL_TYPE =
  /^(?:CHAR|VARCHAR)\([1-9][0-9]*\)$|^(?:NUMERIC|DECIMAL)\([1-9][0-9]*(?:,\s*[0-9]+)?\)$|^CHARACTER VARYING\([1-9][0-9]*\)$/;

const SQL_STRING_LITERAL = /^'(?:[^']|'')*'$/;
const SQL_NUMERIC_LITERAL = /^-?[0-9]+(?:\.[0-9]+)?$/;
const SQL_CONSTANT_DEFAULT = /^(?:TRUE|FALSE|NULL|CURRENT_DATE|CURRENT_TIME|CURRENT_TIMESTAMP|LOCALTIME|LOCALTIMESTAMP)$/i;
const SQL_NOW_DEFAULT = /^now\(\)$/i;

/** Reject a database object name that is not one lower-case snake_case identifier. */
function assertSnakeCaseIdentifier(kind: string, name: string): void {
  if (!SNAKE_CASE_IDENTIFIER.test(name)) {
    throw new Error(`${kind} '${name}' must be snake_case.`);
  }
}

/**
 * Reject a type fragment unless it is one explicitly supported PostgreSQL type.
 *
 * Column constraints intentionally are not accepted here. They belong to their
 * dedicated model fields and therefore cannot be smuggled through `type`.
 */
function assertSafeSQLType(type: string): void {
  const normalized = type.trim().replace(/\s+/g, " ").toUpperCase();
  const supported =
    SIMPLE_SQL_TYPES.has(normalized) ||
    MULTI_WORD_SQL_TYPES.has(normalized) ||
    PARAMETERIZED_SQL_TYPE.test(normalized);
  if (!supported) {
    throw new Error(`Unsafe SQL type: '${type}'`);
  }
}

/**
 * Reject a default fragment unless it is a scalar literal or reviewed built-in.
 *
 * Arbitrary function calls are deliberately excluded because generated DDL may
 * later execute in a privileged database migration context.
 */
function assertSafeDefaultValue(value: string): void {
  const supported =
    SQL_STRING_LITERAL.test(value) ||
    SQL_NUMERIC_LITERAL.test(value) ||
    SQL_CONSTANT_DEFAULT.test(value) ||
    SQL_NOW_DEFAULT.test(value);
  if (!supported) {
    throw new Error(`Unsafe default value: '${value}'`);
  }
}

/** Validate the runtime shape of caller-provided column primitives. */
function assertColumnRuntimeTypes(column: Column): void {
  if (typeof column.name !== "string") {
    throw new Error("Column name must be a string.");
  }
  if (typeof column.type !== "string") {
    throw new Error("Column type must be a string.");
  }
  if (
    column.isPrimaryKey !== undefined &&
    typeof column.isPrimaryKey !== "boolean"
  ) {
    throw new Error("Column isPrimaryKey must be a boolean when provided.");
  }
  if (
    column.isNullable !== undefined &&
    typeof column.isNullable !== "boolean"
  ) {
    throw new Error("Column isNullable must be a boolean when provided.");
  }
  if (
    column.defaultValue !== undefined &&
    typeof column.defaultValue !== "string"
  ) {
    throw new Error("Column defaultValue must be a string when provided.");
  }
}

/** Validate the runtime shape of caller-provided foreign-key primitives. */
function assertForeignKeyRuntimeTypes(foreignKey: ForeignKey): void {
  if (typeof foreignKey.columnName !== "string") {
    throw new Error("Foreign key columnName must be a string.");
  }
  if (typeof foreignKey.referenceTable !== "string") {
    throw new Error("Foreign key referenceTable must be a string.");
  }
  if (typeof foreignKey.referenceColumn !== "string") {
    throw new Error("Foreign key referenceColumn must be a string.");
  }
}

/**
 * Quote one already-validated snake_case SQL identifier.
 *
 * Quoting protects accepted identifiers that also happen to be PostgreSQL
 * reserved words, such as `select` or `from`.
 */
function quoteIdentifier(identifier: string): string {
  return `"${identifier}"`;
}

/** Return a deep plain-data copy so callers never receive mutable model state. */
function cloneTable(table: Table): Table {
  return {
    name: table.name,
    columns: table.columns.map((column) => ({ ...column })),
    foreignKeys: table.foreignKeys.map((foreignKey) => ({ ...foreignKey })),
  };
}

/**
 * In-memory ERD model that emits bounded PostgreSQL `CREATE TABLE` statements.
 *
 * The model owns all stored state. Inputs are validated and copied on ingress,
 * and getters return independent snapshots, so caller mutation cannot bypass a
 * previously completed security check.
 */
export class ERDModel {
  private tables: Map<string, Table> = new Map();

  /** Add a new table and return an independent snapshot of it. */
  addTable(name: string): Table {
    assertSnakeCaseIdentifier("Table", name);
    if (this.tables.has(name)) {
      throw new Error(`Table '${name}' already exists.`);
    }
    const table: Table = { name, columns: [], foreignKeys: [] };
    this.tables.set(name, table);
    return cloneTable(table);
  }

  /** Return an independent snapshot of a table, or `undefined` when absent. */
  getTable(name: string): Table | undefined {
    const table = this.tables.get(name);
    return table ? cloneTable(table) : undefined;
  }

  /** Return independent snapshots of all tables in insertion order. */
  getTables(): Table[] {
    return Array.from(this.tables.values(), cloneTable);
  }

  /**
   * Validate and add one column to an existing table.
   *
   * The stored object contains only copied validated primitives, preventing a
   * caller from mutating the model after this method returns.
   */
  addColumn(tableName: string, column: Column): void {
    assertColumnRuntimeTypes(column);
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
    if (table.columns.some((candidate) => candidate.name === column.name)) {
      throw new Error(
        `Column '${column.name}' already exists in table '${tableName}'.`,
      );
    }

    table.columns.push({
      name: column.name,
      type: column.type,
      isPrimaryKey: column.isPrimaryKey,
      isNullable: column.isNullable,
      defaultValue: column.defaultValue,
    });
  }

  /**
   * Validate and add one foreign-key relationship to an existing table.
   *
   * Both local and referenced columns must already exist. The relationship is
   * copied so later mutation of the caller-owned object cannot alter the model.
   */
  addForeignKey(tableName: string, foreignKey: ForeignKey): void {
    assertForeignKeyRuntimeTypes(foreignKey);
    assertSnakeCaseIdentifier("Table", tableName);
    assertSnakeCaseIdentifier("Column", foreignKey.columnName);
    assertSnakeCaseIdentifier("Reference table", foreignKey.referenceTable);
    assertSnakeCaseIdentifier("Reference column", foreignKey.referenceColumn);

    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`);
    }
    if (!table.columns.some((column) => column.name === foreignKey.columnName)) {
      throw new Error(
        `Column '${foreignKey.columnName}' does not exist in table '${tableName}'.`,
      );
    }

    const referenceTable = this.tables.get(foreignKey.referenceTable);
    if (!referenceTable) {
      throw new Error(
        `Reference table '${foreignKey.referenceTable}' does not exist.`,
      );
    }
    if (
      !referenceTable.columns.some(
        (column) => column.name === foreignKey.referenceColumn,
      )
    ) {
      throw new Error(
        `Reference column '${foreignKey.referenceColumn}' does not exist in table '${foreignKey.referenceTable}'.`,
      );
    }

    table.foreignKeys.push({
      columnName: foreignKey.columnName,
      referenceTable: foreignKey.referenceTable,
      referenceColumn: foreignKey.referenceColumn,
    });
  }

  /**
   * Generate deterministic PostgreSQL DDL for the current model.
   *
   * Every identifier is quoted and every SQL grammar fragment was validated at
   * ingress, so reserved words remain valid without reopening an injection path.
   */
  generateDDL(): string {
    let ddl = "";

    for (const table of this.tables.values()) {
      ddl += `CREATE TABLE ${quoteIdentifier(table.name)} (\n`;

      const columnDefinitions = table.columns.map((column) => {
        let definition = `  ${quoteIdentifier(column.name)} ${column.type}`;
        if (column.isPrimaryKey) {
          definition += " PRIMARY KEY";
        }
        if (column.isNullable === false) {
          definition += " NOT NULL";
        }
        if (column.defaultValue !== undefined) {
          definition += ` DEFAULT ${column.defaultValue}`;
        }
        return definition;
      });

      const foreignKeyDefinitions = table.foreignKeys.map(
        (foreignKey) =>
          `  FOREIGN KEY (${quoteIdentifier(foreignKey.columnName)}) REFERENCES ${quoteIdentifier(foreignKey.referenceTable)}(${quoteIdentifier(foreignKey.referenceColumn)})`,
      );

      ddl += [...columnDefinitions, ...foreignKeyDefinitions].join(",\n");
      ddl += "\n);\n\n";
    }

    return ddl.trim();
  }
}
