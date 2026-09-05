import { describe, expect, it } from "vitest";
import { ERDModel } from "./erd";

describe("ERDModel renameTable ordering regression", () => {
  it("maintains table order and updates FKs when renaming users to members", () => {
    const model = new ERDModel();
    model.addTable("users");
    model.addColumn("users", { name: "id", type: "integer", isPrimaryKey: true });

    model.addTable("posts");
    model.addColumn("posts", { name: "id", type: "integer", isPrimaryKey: true });
    model.addColumn("posts", { name: "user_id", type: "integer" });
    model.addForeignKey("posts", {
      columnName: "user_id",
      referenceTable: "users",
      referenceColumn: "id",
    });

    // Rename users to members
    model.renameTable("users", "members");

    // The order of tables should be [members, posts], not [posts, members]
    const tables = model.getTables();
    expect(tables.map(t => t.name)).toStrictEqual(["members", "posts"]);

    // DDL should also generate members before posts and update REFERENCES
    const ddl = model.generateDDL();
    const expectedDdl = `CREATE TABLE members (
  id integer PRIMARY KEY
);

CREATE TABLE posts (
  id integer PRIMARY KEY,
  user_id integer,
  FOREIGN KEY (user_id) REFERENCES members(id)
);`;
    expect(ddl).toBe(expectedDdl);
  });
});
