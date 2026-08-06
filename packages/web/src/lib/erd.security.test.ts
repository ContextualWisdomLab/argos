import { describe, expect, it } from "vitest";
import { ERDModel } from "./erd";

describe("ERDModel SQL grammar boundaries", () => {
  it("rejects constraints smuggled through the type slot", () => {
    const model = new ERDModel();
    model.addTable("security_events");

    for (const type of [
      "INTEGER PRIMARY KEY",
      "TEXT NOT NULL",
      "INTEGER REFERENCES admin_users(id)",
    ]) {
      expect(() =>
        model.addColumn("security_events", {
          name: "security_value",
          type,
        }),
      ).toThrowError(`Unsafe SQL type: '${type}'`);
    }
  });

  it("accepts explicitly supported multi-word SQL type syntax", () => {
    const model = new ERDModel();
    model.addTable("measurement_events");

    model.addColumn("measurement_events", {
      name: "reading_value",
      type: "DOUBLE PRECISION",
    });
    model.addColumn("measurement_events", {
      name: "recorded_at",
      type: "TIMESTAMP WITH TIME ZONE",
    });

    expect(model.getTable("measurement_events")?.columns).toHaveLength(2);
  });

  it("rejects arbitrary function execution in default values", () => {
    const model = new ERDModel();
    model.addTable("audit_events");

    expect(() =>
      model.addColumn("audit_events", {
        name: "created_at",
        type: "TIMESTAMP",
        defaultValue: "dangerous_function()",
      }),
    ).toThrowError("Unsafe default value: 'dangerous_function()'");
  });

  it("accepts safe built-in and scalar default values", () => {
    const model = new ERDModel();
    model.addTable("audit_events");

    model.addColumn("audit_events", {
      name: "created_at",
      type: "TIMESTAMP",
      defaultValue: "CURRENT_TIMESTAMP",
    });
    model.addColumn("audit_events", {
      name: "retry_count",
      type: "INTEGER",
      defaultValue: "0",
    });
    model.addColumn("audit_events", {
      name: "is_visible",
      type: "BOOLEAN",
      defaultValue: "TRUE",
    });

    expect(model.getTable("audit_events")?.columns).toHaveLength(3);
  });

  it("copies validated column input before storing it", () => {
    const model = new ERDModel();
    model.addTable("account_records");
    const column = { name: "account_id", type: "INTEGER" };

    model.addColumn("account_records", column);
    column.type = "INTEGER PRIMARY KEY";

    expect(model.getTable("account_records")?.columns[0].type).toBe("INTEGER");
  });

  it("copies validated foreign-key input before storing it", () => {
    const model = new ERDModel();
    model.addTable("account_records");
    model.addColumn("account_records", { name: "account_id", type: "INTEGER" });
    model.addTable("audit_events");
    model.addColumn("audit_events", { name: "account_id", type: "INTEGER" });
    const foreignKey = {
      columnName: "account_id",
      referenceTable: "account_records",
      referenceColumn: "account_id",
    };

    model.addForeignKey("audit_events", foreignKey);
    foreignKey.referenceTable = "mutated_target";

    expect(model.getTable("audit_events")?.foreignKeys[0].referenceTable).toBe(
      "account_records",
    );
  });
});
