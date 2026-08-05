import { describe, expect, it, beforeEach } from 'vitest'
import { ERDModel } from './erd'

describe('ERDModel', () => {
  let model: ERDModel

  beforeEach(() => {
    model = new ERDModel()
  })

  describe('Table Management', () => {
    it('should add a new table', () => {
      const table = model.addTable('users')
      expect(table.name).toBe('users')
      expect(model.getTables().length).toBe(1)
      expect(model.getTable('users')).toBe(table)
    })

    it('should throw when adding duplicate table', () => {
      model.addTable('users')
      expect(() => model.addTable('users')).toThrowError("Table 'users' already exists.")
    })

    it('should reject non-snake-case table names', () => {
      expect(() => model.addTable('UserProfiles')).toThrowError(
        "Table 'UserProfiles' must be snake_case."
      )
      expect(() => model.addTable('user-profiles')).toThrowError(
        "Table 'user-profiles' must be snake_case."
      )
    })

    it('should return undefined for non-existent table', () => {
      expect(model.getTable('non_existent')).toBeUndefined()
    })

    it('should remove an existing table', () => {
      model.addTable('users')
      expect(model.getTables().length).toBe(1)
      model.removeTable('users')
      expect(model.getTables().length).toBe(0)
    })

    it('should throw when removing non-existent table', () => {
      expect(() => model.removeTable('users')).toThrowError("Table 'users' does not exist.")
    })

    it('should throw when removing table that is referenced by another table', () => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'integer' })
      model.addTable('posts')
      model.addColumn('posts', { name: 'user_id', type: 'integer' })
      model.addForeignKey('posts', {
        columnName: 'user_id',
        referenceTable: 'users',
        referenceColumn: 'id',
      })
      expect(() => model.removeTable('users')).toThrowError(
        "Cannot remove table 'users' because table 'posts' references it."
      )
    })

    it('should correctly bypass self-referencing check (for coverage)', () => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'integer' })
      model.addColumn('users', { name: 'manager_id', type: 'integer' })
      model.addForeignKey('users', {
        columnName: 'manager_id',
        referenceTable: 'users',
        referenceColumn: 'id',
      })
      // Self-reference does not block removal based on current implementation logic,
      // where `if (table.name !== name)` skips the self.
      model.removeTable('users')
      expect(model.getTables().length).toBe(0)
    })

    it('should continue loop safely if foreign keys reference other tables (for coverage)', () => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'integer' })
      model.addTable('posts')
      model.addColumn('posts', { name: 'id', type: 'integer' })
      model.addTable('comments')
      model.addColumn('comments', { name: 'user_id', type: 'integer' })
      model.addForeignKey('comments', {
        columnName: 'user_id',
        referenceTable: 'users',
        referenceColumn: 'id',
      })

      // We are removing 'posts', 'comments' references 'users' (not 'posts').
      // This will trigger the loop but not hit the throw condition.
      model.removeTable('posts')
      expect(model.getTable('posts')).toBeUndefined()
    })
  })

  describe('Column Management', () => {
    it('should add a column to an existing table', () => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'integer' })
      const table = model.getTable('users')
      expect(table?.columns.length).toBe(1)
      expect(table?.columns[0].name).toBe('id')
    })

    it('should throw when adding a column to a non-existent table', () => {
      expect(() =>
        model.addColumn('non_existent', { name: 'id', type: 'integer' })
      ).toThrowError("Table 'non_existent' does not exist.")
    })

    it('should throw when adding a duplicate column to a table', () => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'integer' })
      expect(() =>
        model.addColumn('users', { name: 'id', type: 'string' })
      ).toThrowError("Column 'id' already exists in table 'users'.")
    })

    it('should reject non-snake-case column names', () => {
      model.addTable('users')
      expect(() =>
        model.addColumn('users', { name: 'createdAt', type: 'timestamp' })
      ).toThrowError("Column 'createdAt' must be snake_case.")
      expect(() =>
        model.addColumn('users', { name: 'created__at', type: 'timestamp' })
      ).toThrowError("Column 'created__at' must be snake_case.")
    })

    it('should allow valid advanced SQL types for valid cases', () => {
      model.addTable('users')
      expect(() =>
        model.addColumn('users', { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE' })
      ).not.toThrow()
      expect(() =>
        model.addColumn('users', { name: 'price', type: 'DECIMAL(10, 2)' })
      ).not.toThrow()
      expect(() =>
        model.addColumn('users', { name: 'id', type: 'INT UNSIGNED' })
      ).not.toThrow()
    })

    it('should reject invalid SQL types for prevention of SQL injection', () => {
      model.addTable('users')
      expect(() =>
        model.addColumn('users', { name: 'id2', type: 'VARCHAR(255); DROP TABLE users; --' })
      ).toThrowError("Invalid SQL type 'VARCHAR(255); DROP TABLE users; --'")
      expect(() =>
        model.addColumn('users', { name: 'id3', type: 'INT(10' })
      ).toThrowError("Invalid SQL type 'INT(10'")
    })

    it('should allow valid function-based default values', () => {
      model.addTable('users')
      expect(() =>
        model.addColumn('users', { name: 'updated_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' })
      ).not.toThrow()
      expect(() =>
        model.addColumn('users', { name: 'last_login', type: 'TIMESTAMP', defaultValue: 'NOW()' })
      ).not.toThrow()
    })

    it('should reject invalid default values for prevention of SQL injection', () => {
      model.addTable('users')
      expect(() =>
        model.addColumn('users', { name: 'status', type: 'VARCHAR(50)', defaultValue: '0; DELETE FROM users;' })
      ).toThrowError("Invalid SQL default value '0; DELETE FROM users;'")
      expect(() =>
        model.addColumn('users', { name: 'status2', type: 'VARCHAR(50)', defaultValue: '"active"' })
      ).toThrowError("Invalid SQL default value '\"active\"'")
    })

    it('should remove a column from an existing table', () => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'integer' })
      expect(model.getTable('users')?.columns.length).toBe(1)
      model.removeColumn('users', 'id')
      expect(model.getTable('users')?.columns.length).toBe(0)
    })

    it('should throw when removing column from non-existent table', () => {
      expect(() => model.removeColumn('users', 'id')).toThrowError("Table 'users' does not exist.")
    })

    it('should throw when removing non-existent column', () => {
      model.addTable('users')
      expect(() => model.removeColumn('users', 'id')).toThrowError("Column 'id' does not exist in table 'users'.")
    })

    it('should throw when removing column referenced by another table', () => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'integer' })
      model.addTable('posts')
      model.addColumn('posts', { name: 'user_id', type: 'integer' })
      model.addForeignKey('posts', {
        columnName: 'user_id',
        referenceTable: 'users',
        referenceColumn: 'id',
      })
      expect(() => model.removeColumn('users', 'id')).toThrowError(
        "Cannot remove column 'id' because table 'posts' references it."
      )
    })

    it('should clean up foreign keys when removing a column with a foreign key', () => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'integer' })
      model.addTable('posts')
      model.addColumn('posts', { name: 'user_id', type: 'integer' })
      model.addForeignKey('posts', {
        columnName: 'user_id',
        referenceTable: 'users',
        referenceColumn: 'id',
      })

      expect(model.getTable('posts')?.foreignKeys.length).toBe(1)
      model.removeColumn('posts', 'user_id')
      expect(model.getTable('posts')?.columns.length).toBe(0)
      expect(model.getTable('posts')?.foreignKeys.length).toBe(0)
    })

    it('should reject column removal when it is referenced by a self-referencing foreign key', () => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'integer' })
      model.addColumn('users', { name: 'manager_id', type: 'integer' })
      model.addForeignKey('users', {
        columnName: 'manager_id',
        referenceTable: 'users',
        referenceColumn: 'id',
      })
      expect(() => model.removeColumn('users', 'id')).toThrowError(
        "Cannot remove column 'id' because table 'users' references it."
      )
    })

    it('should continue loop safely if foreign keys reference other columns (for coverage)', () => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'integer' })
      model.addColumn('users', { name: 'email', type: 'varchar' })
      model.addTable('posts')
      model.addColumn('posts', { name: 'id', type: 'integer' })
      model.addTable('comments')
      model.addColumn('comments', { name: 'user_id', type: 'integer' })
      model.addForeignKey('comments', {
        columnName: 'user_id',
        referenceTable: 'users',
        referenceColumn: 'id',
      })

      // We are removing 'email' from 'users', 'comments' references 'users(id)'.
      // This will trigger the loop but not hit the throw condition.
      model.removeColumn('users', 'email')
      expect(model.getTable('users')?.columns.length).toBe(1)
    })
  })

  describe('Foreign Key Management', () => {
    beforeEach(() => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'integer' })
      model.addTable('posts')
      model.addColumn('posts', { name: 'id', type: 'integer' })
      model.addColumn('posts', { name: 'user_id', type: 'integer' })
    })

    it('should add a foreign key successfully', () => {
      model.addForeignKey('posts', {
        columnName: 'user_id',
        referenceTable: 'users',
        referenceColumn: 'id',
      })
      const postsTable = model.getTable('posts')
      expect(postsTable?.foreignKeys.length).toBe(1)
      expect(postsTable?.foreignKeys[0].referenceTable).toBe('users')
    })

    it('should throw when adding foreign key to non-existent table', () => {
      expect(() => {
        model.addForeignKey('non_existent', {
          columnName: 'user_id',
          referenceTable: 'users',
          referenceColumn: 'id',
        })
      }).toThrowError("Table 'non_existent' does not exist.")
    })

    it('should throw when foreign key column does not exist', () => {
      expect(() => {
        model.addForeignKey('posts', {
          columnName: 'non_existent_col',
          referenceTable: 'users',
          referenceColumn: 'id',
        })
      }).toThrowError("Column 'non_existent_col' does not exist in table 'posts'.")
    })

    it('should throw when reference table does not exist', () => {
      expect(() => {
        model.addForeignKey('posts', {
          columnName: 'user_id',
          referenceTable: 'non_existent_ref',
          referenceColumn: 'id',
        })
      }).toThrowError("Reference table 'non_existent_ref' does not exist.")
    })

    it('should throw when reference column does not exist in reference table', () => {
      expect(() => {
        model.addForeignKey('posts', {
          columnName: 'user_id',
          referenceTable: 'users',
          referenceColumn: 'non_existent_col',
        })
      }).toThrowError("Reference column 'non_existent_col' does not exist in table 'users'.")
    })

    it('should reject non-snake-case foreign key object names', () => {
      expect(() => {
        model.addForeignKey('posts', {
          columnName: 'userId',
          referenceTable: 'users',
          referenceColumn: 'id',
        })
      }).toThrowError("Column 'userId' must be snake_case.")

      expect(() => {
        model.addForeignKey('posts', {
          columnName: 'user_id',
          referenceTable: 'UserProfiles',
          referenceColumn: 'id',
        })
      }).toThrowError("Reference table 'UserProfiles' must be snake_case.")
    })
  })

  describe('DDL Generation', () => {
    it('should generate empty string if no tables exist', () => {
      expect(model.generateDDL()).toBe('')
    })

    it('should generate correct DDL for simple table', () => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'SERIAL', isPrimaryKey: true })
      model.addColumn('users', { name: 'name', type: 'VARCHAR(255)', isNullable: false })
      model.addColumn('users', { name: 'bio', type: 'TEXT' })

      const ddl = model.generateDDL()
      const expected = `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bio TEXT
);`
      expect(ddl).toBe(expected)
    })

    it('should generate correct DDL for column with unique and default constraints', () => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'SERIAL', isPrimaryKey: true })
      model.addColumn('users', { name: 'email', type: 'VARCHAR(255)', isUnique: true })
      model.addColumn('users', { name: 'status', type: 'VARCHAR(50)', defaultValue: "'active'" })

      const ddl = model.generateDDL()
      const expected = `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'active'
);`
      expect(ddl).toBe(expected)
    })

    it('should generate correct DDL for multiple tables with foreign keys', () => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'SERIAL', isPrimaryKey: true })

      model.addTable('posts')
      model.addColumn('posts', { name: 'id', type: 'SERIAL', isPrimaryKey: true })
      model.addColumn('posts', { name: 'user_id', type: 'INTEGER', isNullable: false })

      model.addForeignKey('posts', {
        columnName: 'user_id',
        referenceTable: 'users',
        referenceColumn: 'id',
      })

      const ddl = model.generateDDL()
      const expected = `CREATE TABLE users (
  id SERIAL PRIMARY KEY
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);`
      expect(ddl).toBe(expected)
    })
  })
})
