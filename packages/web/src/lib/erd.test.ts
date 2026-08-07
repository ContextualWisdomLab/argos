import { beforeEach, describe, expect, it } from "vitest";
import { ERDModel } from "./erd";

describe("ERDModel", () => {
  let model: ERDModel;

  beforeEach(() => {
    model = new ERDModel();
  });

  describe("Table Management", () => {
    it("should add a new table", () => {
      const table = model.addTable("users");
      expect(table.name).toBe("users");
      expect(model.getTables().length).toBe(1);
      expect(model.getTable("users")).toStrictEqual(table);
    });

    it("should return independent plain-data snapshots", () => {
      const table = model.addTable("users");
      table.name = "hacked";
      table.columns.push({ name: "injected", type: "TEXT" });

      const firstSnapshot = model.getTables();
      firstSnapshot[0].foreignKeys.push({
        columnName: "injected",
        referenceTable: "injected",
        referenceColumn: "injected",
      });

      expect(model.getTable("users")).toStrictEqual({
        name: "users",
        columns: [],
        foreignKeys: [],
      });
    });

    it("should throw when adding duplicate table", () => {
      model.addTable("users");
      expect(() => model.addTable("users")).toThrowError(
        "Table 'users' already exists.",
      );
    });

    it("should reject non-snake-case table names", () => {
      expect(() => model.addTable("UserProfiles")).toThrowError(
        "Table 'UserProfiles' must be snake_case.",
      );
      expect(() => model.addTable("user-profiles")).toThrowError(
        "Table 'user-profiles' must be snake_case.",
      );
    });

    it("should return undefined for non-existent table", () => {
      expect(model.getTable("non_existent")).toBeUndefined();
    });
  });

  describe("Column Management", () => {
    it("should add a column to an existing table", () => {
      model.addTable("users");
      model.addColumn("users", { name: "id", type: "integer" });
      const table = model.getTable("users");
      expect(table?.columns.length).toBe(1);
      expect(table?.columns[0].name).toBe("id");
    });

    it("should throw when adding a column to a non-existent table", () => {
      expect(() =>
        model.addColumn("non_existent", { name: "id", type: "integer" }),
      ).toThrowError("Table 'non_existent' does not exist.");
    });

    it("should throw when adding a duplicate column to a table", () => {
      model.addTable("users");
      model.addColumn("users", { name: "id", type: "integer" });
      expect(() =>
        model.addColumn("users", { name: "id", type: "TEXT" }),
      ).toThrowError("Column 'id' already exists in table 'users'.");
    });

    it("should reject non-snake-case column names", () => {
      model.addTable("users");
      expect(() =>
        model.addColumn("users", { name: "createdAt", type: "timestamp" }),
      ).toThrowError("Column 'createdAt' must be snake_case.");
      expect(() =>
        model.addColumn("users", { name: "created__at", type: "timestamp" }),
      ).toThrowError("Column 'created__at' must be snake_case.");
    });

    it.each([
      "integer",
      "INT",
      "BIGINT",
      "SMALLINT",
      "SERIAL",
      "BIGSERIAL",
      "TEXT",
      "VARCHAR(255)",
      "CHARACTER VARYING(120)",
      "CHAR(8)",
      "NUMERIC(12, 4)",
      "DECIMAL(9,2)",
      "REAL",
      "DOUBLE PRECISION",
      "BOOLEAN",
      "DATE",
      "TIME",
      "TIME WITH TIME ZONE",
      "TIMESTAMP",
      "TIMESTAMP WITHOUT TIME ZONE",
      "UUID",
      "JSON",
      "JSONB",
      "BYTEA",
    ])("should accept the supported SQL type %s", (type) => {
      model.addTable("users");
      model.addColumn("users", { name: "value_field", type });
      expect(model.getTable("users")?.columns[0].type).toBe(type);
    });

    it.each([
      "INT; DROP TABLE users;",
      "INTEGER PRIMARY KEY",
      "TEXT NOT NULL",
      "INTEGER UNIQUE",
      "INTEGER REFERENCES users(id)",
      "VARCHAR(255) CHECK (true)",
      "made_up_type",
    ])("should reject unsafe or unsupported SQL type %s", (type) => {
      model.addTable("users");
      expect(() =>
        model.addColumn("users", { name: "value_field", type }),
      ).toThrowError(`Unsafe SQL type: '${type}'`);
    });

    it.each([
      "'active'",
      "''",
      "42",
      "-3.14",
      "TRUE",
      "false",
      "NULL",
      "CURRENT_DATE",
      "CURRENT_TIME",
      "CURRENT_TIMESTAMP",
      "LOCALTIME",
      "LOCALTIMESTAMP",
      "now()",
    ])("should accept the supported SQL default %s", (defaultValue) => {
      model.addTable("users");
      model.addColumn("users", {
        name: "value_field",
        type: "TEXT",
        defaultValue,
      });
      expect(model.getTable("users")?.columns[0].defaultValue).toBe(defaultValue);
    });

    it.each([
      "1; DROP TABLE users;",
      "unapproved_function()",
      "pg_sleep()",
      "CURRENT_TIMESTAMP()",
      "'unterminated",
    ])("should reject unsafe SQL default %s", (defaultValue) => {
      model.addTable("users");
      expect(() =>
        model.addColumn("users", {
          name: "value_field",
          type: "TEXT",
          defaultValue,
        }),
      ).toThrowError(`Unsafe default value: '${defaultValue}'`);
    });

    it("should store validated column primitives instead of caller-owned objects", () => {
      model.addTable("users");
      const column = {
        name: "status_field",
        type: "TEXT",
        isPrimaryKey: false,
        isNullable: false,
        defaultValue: "'safe'",
      };

      model.addColumn("users", column);
      column.name = "changed_name";
      column.type = "TEXT NOT NULL";
      column.isPrimaryKey = true;
      column.isNullable = true;
      column.defaultValue = "unapproved_function()";

      expect(model.getTable("users")?.columns[0]).toStrictEqual({
        name: "status_field",
        type: "TEXT",
        isPrimaryKey: false,
        isNullable: false,
        defaultValue: "'safe'",
      });
    });

    it.each([
      [{ name: 7, type: "TEXT" }, "Column name must be a string."],
      [{ name: "value_field", type: 7 }, "Column type must be a string."],
      [
        { name: "value_field", type: "TEXT", isPrimaryKey: "yes" },
        "Column isPrimaryKey must be a boolean when provided.",
      ],
      [
        { name: "value_field", type: "TEXT", isNullable: "yes" },
        "Column isNullable must be a boolean when provided.",
      ],
      [
        { name: "value_field", type: "TEXT", defaultValue: 7 },
        "Column defaultValue must be a string when provided.",
      ],
    ])("should reject malformed runtime column values %#", (column, message) => {
      model.addTable("users");
      expect(() =>
        model.addColumn("users", column as never),
      ).toThrowError(message as string);
    });
  });

  describe("Foreign Key Management", () => {
    beforeEach(() => {
      model.addTable("users");
      model.addColumn("users", { name: "id", type: "integer" });
      model.addTable("posts");
      model.addColumn("posts", { name: "id", type: "integer" });
      model.addColumn("posts", { name: "user_id", type: "integer" });
    });

    it("should add a foreign key successfully", () => {
      model.addForeignKey("posts", {
        columnName: "user_id",
        referenceTable: "users",
        referenceColumn: "id",
      });
      const postsTable = model.getTable("posts");
      expect(postsTable?.foreignKeys.length).toBe(1);
      expect(postsTable?.foreignKeys[0].referenceTable).toBe("users");
    });

    it("should store validated foreign-key primitives independently", () => {
      const foreignKey = {
        columnName: "user_id",
        referenceTable: "users",
        referenceColumn: "id",
      };
      model.addForeignKey("posts", foreignKey);
      foreignKey.columnName = "changed_column";
      foreignKey.referenceTable = "changed_table";
      foreignKey.referenceColumn = "changed_reference";

      expect(model.getTable("posts")?.foreignKeys[0]).toStrictEqual({
        columnName: "user_id",
        referenceTable: "users",
        referenceColumn: "id",
      });
    });

    it("should throw when adding foreign key to non-existent table", () => {
      expect(() => {
        model.addForeignKey("non_existent", {
          columnName: "user_id",
          referenceTable: "users",
          referenceColumn: "id",
        });
      }).toThrowError("Table 'non_existent' does not exist.");
    });

    it("should throw when foreign key column does not exist", () => {
      expect(() => {
        model.addForeignKey("posts", {
          columnName: "non_existent_col",
          referenceTable: "users",
          referenceColumn: "id",
        });
      }).toThrowError(
        "Column 'non_existent_col' does not exist in table 'posts'.",
      );
    });

    it("should throw when reference table does not exist", () => {
      expect(() => {
        model.addForeignKey("posts", {
          columnName: "user_id",
          referenceTable: "non_existent_ref",
          referenceColumn: "id",
        });
      }).toThrowError("Reference table 'non_existent_ref' does not exist.");
    });

    it("should throw when reference column does not exist in reference table", () => {
      expect(() => {
        model.addForeignKey("posts", {
          columnName: "user_id",
          referenceTable: "users",
          referenceColumn: "non_existent_col",
        });
      }).toThrowError(
        "Reference column 'non_existent_col' does not exist in table 'users'.",
      );
    });

    it("should reject non-snake-case foreign key object names", () => {
      expect(() => {
        model.addForeignKey("posts", {
          columnName: "userId",
          referenceTable: "users",
          referenceColumn: "id",
        });
      }).toThrowError("Column 'userId' must be snake_case.");

      expect(() => {
        model.addForeignKey("posts", {
          columnName: "user_id",
          referenceTable: "UserProfiles",
          referenceColumn: "id",
        });
      }).toThrowError("Reference table 'UserProfiles' must be snake_case.");
    });

    it.each([
      [{ columnName: 7, referenceTable: "users", referenceColumn: "id" }, "Foreign key columnName must be a string."],
      [{ columnName: "user_id", referenceTable: 7, referenceColumn: "id" }, "Foreign key referenceTable must be a string."],
      [{ columnName: "user_id", referenceTable: "users", referenceColumn: 7 }, "Foreign key referenceColumn must be a string."],
    ])("should reject malformed runtime foreign-key values %#", (foreignKey, message) => {
      expect(() =>
        model.addForeignKey("posts", foreignKey as never),
      ).toThrowError(message as string);
    });
  });

  describe("DDL Generation", () => {
    it("should generate empty string if no tables exist", () => {
      expect(model.generateDDL()).toBe("");
    });

    it("should generate quoted DDL for a simple table", () => {
      model.addTable("users");
      model.addColumn("users", {
        name: "id",
        type: "SERIAL",
        isPrimaryKey: true,
      });
      model.addColumn("users", {
        name: "name",
        type: "VARCHAR(255)",
        isNullable: false,
      });
      model.addColumn("users", { name: "bio", type: "TEXT" });
      model.addColumn("users", {
        name: "status",
        type: "VARCHAR(20)",
        defaultValue: "'active'",
      });

      const ddl = model.generateDDL();
      const expected = `CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "bio" TEXT,
  "status" VARCHAR(20) DEFAULT 'active'
);`;
      expect(ddl).toBe(expected);
    });

    it("should generate quoted DDL for multiple tables with foreign keys", () => {
      model.addTable("users");
      model.addColumn("users", {
        name: "id",
        type: "SERIAL",
        isPrimaryKey: true,
      });

      model.addTable("posts");
      model.addColumn("posts", {
        name: "id",
        type: "SERIAL",
        isPrimaryKey: true,
      });
      model.addColumn("posts", {
        name: "user_id",
        type: "INTEGER",
        isNullable: false,
      });

      model.addForeignKey("posts", {
        columnName: "user_id",
        referenceTable: "users",
        referenceColumn: "id",
      });

      const ddl = model.generateDDL();
      const expected = `CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY
);

CREATE TABLE "posts" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
);`;
      expect(ddl).toBe(expected);
    });

    it("should quote reserved PostgreSQL words used as accepted identifiers", () => {
      model.addTable("select");
      model.addColumn("select", { name: "from", type: "INTEGER" });

      expect(model.generateDDL()).toBe(`CREATE TABLE "select" (
  "from" INTEGER
);`);
    });
  });
});
