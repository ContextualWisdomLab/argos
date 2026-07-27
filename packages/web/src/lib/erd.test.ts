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

    it('should reject column types containing semicolons to prevent SQL injection', () => {
      model.addTable('users')
      expect(() =>
        model.addColumn('users', { name: 'id', type: 'integer;' })
      ).toThrowError("Invalid SQL type 'integer;': semicolons are not allowed.")
      expect(() =>
        model.addColumn('users', { name: 'name', type: 'VARCHAR(255); DROP TABLE users;' })
      ).toThrowError("Invalid SQL type 'VARCHAR(255); DROP TABLE users;': semicolons are not allowed.")
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
