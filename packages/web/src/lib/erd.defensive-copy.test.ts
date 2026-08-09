import { beforeEach, describe, expect, it } from "vitest";
import { ERDModel, type Column, type ForeignKey } from "./erd";

describe("ERDModel defensive copies", () => {
  let model: ERDModel;

  beforeEach(() => {
    model = new ERDModel();
  });

  it("keeps table state isolated from add/get/list return values", () => {
    const added = model.addTable("users");
    added.name = "mutated";
    added.columns.push({ name: "injected", type: "TEXT" });

    const fetched = model.getTable("users");
    expect(fetched).toStrictEqual({ name: "users", columns: [], foreignKeys: [] });

    if (!fetched) {
      throw new Error("users table should exist");
    }
    fetched.name = "changed_again";
    fetched.foreignKeys.push({
      columnName: "id",
      referenceTable: "users",
      referenceColumn: "id",
    });

    const listed = model.getTables();
    expect(listed).toStrictEqual([
      { name: "users", columns: [], foreignKeys: [] },
    ]);
    listed[0].name = "list_mutation";
    listed[0].columns.push({ name: "another_injected", type: "TEXT" });

    expect(model.getTable("users")).toStrictEqual({
      name: "users",
      columns: [],
      foreignKeys: [],
    });
  });

  it("copies a column before storing it", () => {
    model.addTable("users");
    const column: Column = {
      name: "display_name",
      type: "VARCHAR(255)",
      isNullable: false,
    };

    model.addColumn("users", column);
    column.name = "mutated_name";
    column.type = "TEXT PRIMARY KEY";
    column.isNullable = true;

    expect(model.getTable("users")?.columns).toStrictEqual([
      {
        name: "display_name",
        type: "VARCHAR(255)",
        isNullable: false,
      },
    ]);
  });

  it("copies a foreign key before storing it", () => {
    model.addTable("users");
    model.addColumn("users", { name: "id", type: "INTEGER" });
    model.addTable("posts");
    model.addColumn("posts", { name: "user_id", type: "INTEGER" });

    const foreignKey: ForeignKey = {
      columnName: "user_id",
      referenceTable: "users",
      referenceColumn: "id",
    };
    model.addForeignKey("posts", foreignKey);

    foreignKey.columnName = "mutated_column";
    foreignKey.referenceTable = "mutated_table";
    foreignKey.referenceColumn = "mutated_reference";

    expect(model.getTable("posts")?.foreignKeys).toStrictEqual([
      {
        columnName: "user_id",
        referenceTable: "users",
        referenceColumn: "id",
      },
    ]);
  });
});
