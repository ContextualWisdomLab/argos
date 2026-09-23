import { describe, expect, it } from "vitest";
import { ERDModel } from "./erd";

describe("ERDModel PostgreSQL relation namespace", () => {
  it("rejects the same explicit index name on different tables", () => {
    const model = new ERDModel();
    model.addTable("users");
    model.addColumn("users", { name: "email", type: "varchar" });
    model.addTable("accounts");
    model.addColumn("accounts", { name: "email", type: "varchar" });

    model.addIndex("users", { name: "idx_email", columnName: "email" });

    expect(() =>
      model.addIndex("accounts", { name: "idx_email", columnName: "email" }),
    ).toThrowError("Index 'idx_email' conflicts with an existing relation name.");
  });

  it("rejects an explicit index name that collides with an existing table", () => {
    const model = new ERDModel();
    model.addTable("users");
    model.addColumn("users", { name: "email", type: "varchar" });
    model.addTable("reporting_index");

    expect(() =>
      model.addIndex("users", {
        name: "reporting_index",
        columnName: "email",
      }),
    ).toThrowError(
      "Index 'reporting_index' conflicts with an existing relation name.",
    );
  });

  it("rejects a table name that collides with an existing explicit index", () => {
    const model = new ERDModel();
    model.addTable("users");
    model.addColumn("users", { name: "email", type: "varchar" });
    model.addIndex("users", { name: "reporting_index", columnName: "email" });

    expect(() => model.addTable("reporting_index")).toThrowError(
      "Table 'reporting_index' conflicts with an existing relation name.",
    );
  });
});
