import { beforeEach, describe, expect, it } from "vitest";
import { ERDModel, type Column, type ForeignKey } from "./erd";

describe("ERDModel security regressions", () => {
  let model: ERDModel;

  beforeEach(() => {
    model = new ERDModel();
  });

  it("rejects SQL type suffixes that inject column constraints", () => {
    model.addTable("users");
    const unsafeTypes = [
      "TEXT PRIMARY KEY",
      "INTEGER NOT NULL",
      "VARCHAR(255) UNIQUE",
      "INTEGER REFERENCES users(id)",
      "INTEGER GENERATED ALWAYS AS IDENTITY",
      "TEXT DEFAULT secret",
    ];

    unsafeTypes.forEach((type, index) => {
      expect(() =>
        model.addColumn("users", {
          name: `unsafe_${index}`,
          type,
        }),
      ).toThrowError(`Invalid SQL type: '${type}'`);
      expect(model.getTable("users")?.columns).toStrictEqual([]);
    });
  });

  it("rejects non-canonical or unbounded SQL type text", () => {
    model.addTable("users");
    const unsafeTypes = [
      " TEXT",
      "TEXT ",
      "TEXT\t",
      "TEXT\n",
      `X${"A".repeat(128)}`,
    ];

    unsafeTypes.forEach((type, index) => {
      expect(() =>
        model.addColumn("users", {
          name: `unsafe_format_${index}`,
          type,
        }),
      ).toThrowError(`Invalid SQL type: '${type}'`);
      expect(model.getTable("users")?.columns).toStrictEqual([]);
    });
  });

  it("keeps table state isolated from add/get/list return values", () => {
    const added = model.addTable("users");
    added.name = "mutated";
    added.columns.push({ name: "injected", type: "TEXT" });

    const fetched = model.getTable("users");
    expect(fetched).toStrictEqual({
      name: "users",
      columns: [],
      foreignKeys: [],
    });
    if (!fetched) throw new Error("users table should exist");

    fetched.name = "changed_again";
    fetched.foreignKeys.push({
      columnName: "id",
      referenceTable: "users",
      referenceColumn: "id",
    });

    const listed = model.getTables();
    listed[0]!.name = "list_mutation";
    listed[0]!.columns.push({ name: "another_injected", type: "TEXT" });

    expect(model.getTable("users")).toStrictEqual({
      name: "users",
      columns: [],
      foreignKeys: [],
    });
  });

  it("copies caller-owned columns and foreign keys before storing them", () => {
    model.addTable("users");
    const userId: Column = { name: "id", type: "INTEGER" };
    model.addColumn("users", userId);
    userId.name = "mutated_id";
    userId.type = "TEXT PRIMARY KEY";

    model.addTable("posts");
    const postUserId: Column = { name: "user_id", type: "INTEGER" };
    model.addColumn("posts", postUserId);

    const foreignKey: ForeignKey = {
      columnName: "user_id",
      referenceTable: "users",
      referenceColumn: "id",
    };
    model.addForeignKey("posts", foreignKey);
    postUserId.name = "mutated_user_id";
    foreignKey.columnName = "mutated_column";
    foreignKey.referenceTable = "mutated_table";
    foreignKey.referenceColumn = "mutated_reference";

    expect(model.getTable("users")?.columns).toStrictEqual([
      { name: "id", type: "INTEGER" },
    ]);
    expect(model.getTable("posts")?.columns).toStrictEqual([
      { name: "user_id", type: "INTEGER" },
    ]);
    expect(model.getTable("posts")?.foreignKeys).toStrictEqual([
      {
        columnName: "user_id",
        referenceTable: "users",
        referenceColumn: "id",
      },
    ]);
  });
});
