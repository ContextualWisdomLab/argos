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

  describe('Update and Remove Table Management', () => {
    beforeEach(() => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'integer' })
    })

    it('should update table name', () => {
      model.updateTable('users', 'members')
      expect(model.getTable('users')).toBeUndefined()
      expect(model.getTable('members')).toBeDefined()
    })

    it('should update foreign key references when table name is updated', () => {
      model.addTable('posts')
      model.addColumn('posts', { name: 'id', type: 'integer' })
      model.addColumn('posts', { name: 'user_id', type: 'integer' })
      model.addForeignKey('posts', {
        columnName: 'user_id',
        referenceTable: 'users',
        referenceColumn: 'id'
      })

      model.updateTable('users', 'members')
      const postsTable = model.getTable('posts')
      expect(postsTable?.foreignKeys[0].referenceTable).toBe('members')
    })

    it('should throw when updating a non-existent table', () => {
      expect(() => model.updateTable('non_existent', 'new_name')).toThrowError("Table 'non_existent' does not exist.")
    })

    it('should throw when updating to an existing table name', () => {
      model.addTable('members')
      expect(() => model.updateTable('users', 'members')).toThrowError("Table 'members' already exists.")
    })

    it('should remove table', () => {
      model.removeTable('users')
      expect(model.getTable('users')).toBeUndefined()
    })

    it('should throw when removing a non-existent table', () => {
      expect(() => model.removeTable('non_existent')).toThrowError("Table 'non_existent' does not exist.")
    })

    it('should throw when removing a table referenced by foreign keys', () => {
      model.addTable('posts')
      model.addColumn('posts', { name: 'id', type: 'integer' })
      model.addColumn('posts', { name: 'user_id', type: 'integer' })
      model.addForeignKey('posts', {
        columnName: 'user_id',
        referenceTable: 'users',
        referenceColumn: 'id'
      })

      expect(() => model.removeTable('users')).toThrowError("Cannot remove table 'users' as it is referenced by 'posts'.")
    })
  })

  describe('Update and Remove Column Management', () => {
    beforeEach(() => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'integer' })
      model.addColumn('users', { name: 'name', type: 'string' })
    })

    it('should update column properties', () => {
      model.updateColumn('users', 'name', { name: 'full_name', type: 'varchar(255)', isNullable: false })
      const table = model.getTable('users')
      expect(table?.columns.find(c => c.name === 'full_name')).toBeDefined()
      expect(table?.columns.find(c => c.name === 'name')).toBeUndefined()
    })

    it('should throw when updating column in non-existent table', () => {
      expect(() => model.updateColumn('non_existent', 'id', { name: 'id', type: 'integer' })).toThrowError("Table 'non_existent' does not exist.")
    })

    it('should throw when updating non-existent column', () => {
      expect(() => model.updateColumn('users', 'non_existent', { name: 'new_name', type: 'string' })).toThrowError("Column 'non_existent' does not exist in table 'users'.")
    })

    it('should throw when updating column name to an already existing name', () => {
      expect(() => model.updateColumn('users', 'name', { name: 'id', type: 'string' })).toThrowError("Column 'id' already exists in table 'users'.")
    })

    it('should throw on SQL injection attempt during column update', () => {
      expect(() => model.updateColumn('users', 'name', { name: 'name', type: 'varchar(255); DROP TABLE users;' })).toThrowError("SQL injection prevention: Statement terminators (;) are not allowed.")
    })

    it('should update foreign key references and indices when column is updated', () => {
      model.addTable('posts')
      model.addColumn('posts', { name: 'id', type: 'integer' })
      model.addColumn('posts', { name: 'user_id', type: 'integer' })
      model.addForeignKey('posts', {
        columnName: 'user_id',
        referenceTable: 'users',
        referenceColumn: 'id'
      })
      model.addIndex('posts', { name: 'idx_user_id', columns: ['user_id'] })

      model.updateColumn('posts', 'user_id', { name: 'author_id', type: 'integer' })
      model.updateColumn('users', 'id', { name: 'user_id', type: 'integer' })

      // Additional test for index column rename with multiple columns
      model.addTable('tags')
      model.addColumn('tags', { name: 'tag_id', type: 'integer' })
      model.addColumn('tags', { name: 'tag_name', type: 'string' })
      model.addIndex('tags', { name: 'idx_multi', columns: ['tag_id', 'tag_name'] })
      model.updateColumn('tags', 'tag_name', { name: 'name', type: 'string' })

      const postsTable = model.getTable('posts')
      expect(postsTable?.foreignKeys[0].columnName).toBe('author_id')
      expect(postsTable?.foreignKeys[0].referenceColumn).toBe('user_id')
      expect(postsTable?.indices[0].columns[0]).toBe('author_id')
    })

    it('should remove column', () => {
      model.removeColumn('users', 'name')
      const table = model.getTable('users')
      expect(table?.columns.find(c => c.name === 'name')).toBeUndefined()
    })

    it('should throw when removing non-existent column', () => {
      expect(() => model.removeColumn('users', 'non_existent')).toThrowError("Column 'non_existent' does not exist in table 'users'.")
    })

    it('should throw when removing column in non-existent table', () => {
      expect(() => model.removeColumn('non_existent', 'id')).toThrowError("Table 'non_existent' does not exist.")
    })

    it('should throw when removing column used in foreign key of the same table', () => {
      model.addTable('profiles')
      model.addColumn('profiles', { name: 'id', type: 'integer' })
      model.addColumn('profiles', { name: 'user_id', type: 'integer' })
      model.addForeignKey('profiles', { columnName: 'user_id', referenceTable: 'users', referenceColumn: 'id' })

      expect(() => model.removeColumn('profiles', 'user_id')).toThrowError("Cannot remove column 'user_id' as it is part of a foreign key.")
    })

    it('should throw when removing column referenced by another table', () => {
      model.addTable('posts')
      model.addColumn('posts', { name: 'id', type: 'integer' })
      model.addColumn('posts', { name: 'user_id', type: 'integer' })
      model.addForeignKey('posts', {
        columnName: 'user_id',
        referenceTable: 'users',
        referenceColumn: 'id'
      })

      expect(() => model.removeColumn('users', 'id')).toThrowError("Cannot remove column 'id' as it is referenced by a foreign key in table 'posts'.")
    })

    it('should throw when removing column used in index', () => {
      model.addIndex('users', { name: 'idx_name', columns: ['name'] })
      expect(() => model.removeColumn('users', 'name')).toThrowError("Cannot remove column 'name' as it is part of index 'idx_name'.")
    })
  })

  describe('Index Management', () => {
    beforeEach(() => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'integer' })
      model.addColumn('users', { name: 'email', type: 'string' })
    })

    it('should add an index', () => {
      model.addIndex('users', { name: 'idx_email', columns: ['email'], isUnique: true })
      const table = model.getTable('users')
      expect(table?.indices.length).toBe(1)
      expect(table?.indices[0].name).toBe('idx_email')
    })

    it('should throw when adding index to non-existent table', () => {
      expect(() => model.addIndex('non_existent', { name: 'idx_test', columns: ['id'] })).toThrowError("Table 'non_existent' does not exist.")
    })

    it('should throw when adding index with duplicate name', () => {
      model.addIndex('users', { name: 'idx_email', columns: ['email'] })
      expect(() => model.addIndex('users', { name: 'idx_email', columns: ['id'] })).toThrowError("Index 'idx_email' already exists in table 'users'.")
    })

    it('should throw when adding index with non-existent column', () => {
      expect(() => model.addIndex('users', { name: 'idx_test', columns: ['non_existent'] })).toThrowError("Column 'non_existent' does not exist in table 'users'.")
    })

    it('should remove an index', () => {
      model.addIndex('users', { name: 'idx_email', columns: ['email'] })
      model.removeIndex('users', 'idx_email')
      const table = model.getTable('users')
      expect(table?.indices.length).toBe(0)
    })

    it('should throw when removing index from non-existent table', () => {
      expect(() => model.removeIndex('non_existent', 'idx_test')).toThrowError("Table 'non_existent' does not exist.")
    })

    it('should throw when removing non-existent index', () => {
      expect(() => model.removeIndex('users', 'idx_test')).toThrowError("Index 'idx_test' does not exist in table 'users'.")
    })
  })

  describe('Remove Foreign Key Management', () => {
    beforeEach(() => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'integer' })
      model.addTable('posts')
      model.addColumn('posts', { name: 'id', type: 'integer' })
      model.addColumn('posts', { name: 'user_id', type: 'integer' })
      model.addForeignKey('posts', {
        columnName: 'user_id',
        referenceTable: 'users',
        referenceColumn: 'id',
      })
    })

    it('should remove a foreign key', () => {
      model.removeForeignKey('posts', 'user_id', 'users', 'id')
      const table = model.getTable('posts')
      expect(table?.foreignKeys.length).toBe(0)
    })

    it('should throw when removing foreign key from non-existent table', () => {
      expect(() => model.removeForeignKey('non_existent', 'user_id', 'users', 'id')).toThrowError("Table 'non_existent' does not exist.")
    })

    it('should throw when removing non-existent foreign key', () => {
      expect(() => model.removeForeignKey('posts', 'id', 'users', 'id')).toThrowError("Foreign key does not exist.")
    })
  })

  describe('Security and Edge Cases', () => {
    it('should reject column types containing statement terminators (SQL injection prevention)', () => {
      model.addTable('users')
      expect(() =>
        model.addColumn('users', { name: 'id', type: 'integer; DROP TABLE users;' })
      ).toThrowError("SQL injection prevention: Statement terminators (;) are not allowed.")
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

    it('should generate correct DDL for table with indices', () => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'SERIAL', isPrimaryKey: true })
      model.addColumn('users', { name: 'email', type: 'VARCHAR(255)', isNullable: false })
      model.addColumn('users', { name: 'name', type: 'VARCHAR(255)' })

      model.addIndex('users', { name: 'idx_email', columns: ['email'], isUnique: true })
      model.addIndex('users', { name: 'idx_name', columns: ['name'] })

      const ddl = model.generateDDL()
      const expected = `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255)
);

CREATE UNIQUE INDEX idx_email ON users (email);

CREATE INDEX idx_name ON users (name);`
      expect(ddl).toBe(expected)
    })
  })

  describe('Mermaid Generation', () => {
    it('should generate empty mermaid graph if no tables exist', () => {
      expect(model.generateMermaid()).toBe('erDiagram')
    })

    it('should generate correct mermaid syntax for simple table', () => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'SERIAL', isPrimaryKey: true })
      model.addColumn('users', { name: 'name', type: 'VARCHAR(255)' })

      const mermaid = model.generateMermaid()
      const expected = `erDiagram
  users {
    SERIAL id PK
    VARCHAR name
  }`
      expect(mermaid).toBe(expected)
    })

    it('should generate correct mermaid syntax with relationships', () => {
      model.addTable('users')
      model.addColumn('users', { name: 'id', type: 'SERIAL', isPrimaryKey: true })

      model.addTable('posts')
      model.addColumn('posts', { name: 'id', type: 'SERIAL', isPrimaryKey: true })
      model.addColumn('posts', { name: 'user_id', type: 'INTEGER' })

      model.addForeignKey('posts', {
        columnName: 'user_id',
        referenceTable: 'users',
        referenceColumn: 'id',
      })

      const mermaid = model.generateMermaid()
      const expected = `erDiagram
  users {
    SERIAL id PK
  }
  posts {
    SERIAL id PK
    INTEGER user_id FK
  }
  posts }o--|| users : "user_id -> id"`
      expect(mermaid).toBe(expected)
    })
  })
})
