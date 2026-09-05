import { describe, expect, it } from "vitest";
import { ERDModel } from "./erd";

describe("ERDModel rename stability", () => {
  it("preserves dependency-safe table order when renaming a referenced table", () => {
    const model = new ERDModel();
    model.addTable("users");
    model.addColumn("users", { name: "id", type: "integer" });
    model.addTable("posts");
    model.addColumn("posts", { name: "id", type: "integer" });
    model.addColumn("posts", { name: "user_id", type: "integer" });
    model.addForeignKey("posts", {
      columnName: "user_id",
      referenceTable: "users",
      referenceColumn: "id",
    });

    model.renameTable("users", "members");

    expect(model.getTables().map((table) => table.name)).toEqual([
      "members",
      "posts",
    ]);

    const ddl = model.generateDDL();
    expect(ddl.indexOf("CREATE TABLE members")).toBeLessThan(
      ddl.indexOf("CREATE TABLE posts"),
    );
    expect(ddl).toContain("REFERENCES members(id)");
  });
});
