import { Pool } from 'pg';
import db from '../database';

// Tipos de dados suportados
export type FieldType = 
  | 'SERIAL' 
  | 'INTEGER' 
  | 'BIGINT'
  | 'VARCHAR'
  | 'TEXT'
  | 'BOOLEAN'
  | 'DECIMAL'
  | 'NUMERIC'
  | 'TIMESTAMP'
  | 'DATE'
  | 'JSONB';

// Definição de campo
export interface FieldDefinition {
  type: FieldType;
  primaryKey?: boolean;
  unique?: boolean;
  nullable?: boolean;
  default?: any;
  length?: number;
  precision?: number;
  scale?: number;
  references?: {
    table: string;
    column: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  };
}

// Definição de índice
export interface IndexDefinition {
  name: string;
  columns: string[];
  unique?: boolean;
}

// Classe base para modelos
export abstract class BaseModel {
  protected static tableName: string;
  protected static fields: Record<string, FieldDefinition> = {};
  protected static indexes: IndexDefinition[] = [];

  // Método para definir o nome da tabela
  static setTableName(name: string) {
    this.tableName = name;
  }

  // Método para definir campos
  static defineField(name: string, definition: FieldDefinition) {
    this.fields[name] = definition;
  }

  // Método para definir índices
  static defineIndex(definition: IndexDefinition) {
    this.indexes.push(definition);
  }

  // Gerar SQL para criação da tabela
  static generateCreateTableSQL(): string {
    const columns: string[] = [];
    const constraints: string[] = [];

    // Processar campos
    for (const [fieldName, field] of Object.entries(this.fields)) {
      let columnDef = `"${fieldName}" ${this.getPostgreSQLType(field)}`;

      // Primary key
      if (field.primaryKey) {
        columnDef += ' PRIMARY KEY';
      }

      // Not null
      if (!field.nullable && !field.primaryKey) {
        columnDef += ' NOT NULL';
      }

      // Unique
      if (field.unique) {
        columnDef += ' UNIQUE';
      }

      // Default
      if (field.default !== undefined) {
        if (typeof field.default === 'string') {
          columnDef += ` DEFAULT '${field.default}'`;
        } else if (field.default === 'CURRENT_TIMESTAMP') {
          columnDef += ' DEFAULT CURRENT_TIMESTAMP';
        } else {
          columnDef += ` DEFAULT ${field.default}`;
        }
      }

      columns.push(columnDef);

      // Foreign key constraints
      if (field.references) {
        const fkName = `fk_${this.tableName}_${fieldName}`;
        let fkConstraint = `CONSTRAINT ${fkName} FOREIGN KEY ("${fieldName}") REFERENCES ${field.references.table}(${field.references.column})`;
        
        if (field.references.onDelete) {
          fkConstraint += ` ON DELETE ${field.references.onDelete}`;
        }
        if (field.references.onUpdate) {
          fkConstraint += ` ON UPDATE ${field.references.onUpdate}`;
        }
        
        constraints.push(fkConstraint);
      }
    }

    // Combinar colunas e constraints
    const allDefinitions = [...columns, ...constraints];

    return `CREATE TABLE IF NOT EXISTS "${this.tableName}" (\n  ${allDefinitions.join(',\n  ')}\n);`;
  }

  // Gerar SQL para índices
  static generateIndexesSQL(): string[] {
    return this.indexes.map(index => {
      const uniqueKeyword = index.unique ? 'UNIQUE ' : '';
      const columnList = index.columns.map(col => `"${col}"`).join(', ');
      return `CREATE ${uniqueKeyword}INDEX IF NOT EXISTS "${index.name}" ON "${this.tableName}" (${columnList});`;
    });
  }

  // Converter tipo para PostgreSQL
  private static getPostgreSQLType(field: FieldDefinition): string {
    switch (field.type) {
      case 'SERIAL':
        return 'SERIAL';
      case 'INTEGER':
        return 'INTEGER';
      case 'BIGINT':
        return 'BIGINT';
      case 'VARCHAR':
        return field.length ? `VARCHAR(${field.length})` : 'VARCHAR(255)';
      case 'TEXT':
        return 'TEXT';
      case 'BOOLEAN':
        return 'BOOLEAN';
      case 'DECIMAL':
        if (field.precision && field.scale) {
          return `DECIMAL(${field.precision},${field.scale})`;
        }
        return 'DECIMAL(10,2)';
      case 'NUMERIC':
        if (field.precision && field.scale) {
          return `NUMERIC(${field.precision},${field.scale})`;
        }
        return 'NUMERIC(10,2)';
      case 'TIMESTAMP':
        return 'TIMESTAMP';
      case 'DATE':
        return 'DATE';
      case 'JSONB':
        return 'JSONB';
      default:
        throw new Error(`Tipo de campo não suportado: ${field.type}`);
    }
  }

  // Criar tabela no banco
  static async createTable(): Promise<void> {
    try {
      console.log(`📋 Criando tabela ${this.tableName}...`);
      
      // Criar tabela
      const createSQL = this.generateCreateTableSQL();
      await db.query(createSQL);
      
      // Criar índices
      const indexSQLs = this.generateIndexesSQL();
      for (const indexSQL of indexSQLs) {
        await db.query(indexSQL);
      }
      
      console.log(`✅ Tabela ${this.tableName} criada com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao criar tabela ${this.tableName}:`, error);
      throw error;
    }
  }

  // Verificar se tabela existe
  static async tableExists(): Promise<boolean> {
    try {
      const result = await db.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [this.tableName]
      );
      return result.rows[0].exists;
    } catch (error) {
      console.error(`Erro ao verificar tabela ${this.tableName}:`, error);
      return false;
    }
  }

  // Sincronizar modelo com banco (criar se não existir)
  static async sync(): Promise<void> {
    const exists = await this.tableExists();
    if (!exists) {
      await this.createTable();
    } else {
      console.log(`ℹ️ Tabela ${this.tableName} já existe`);
    }
  }

  // Métodos de query básicos
  static async findAll(conditions?: Record<string, any>): Promise<any[]> {
    let query = `SELECT * FROM "${this.tableName}"`;
    const values: any[] = [];

    if (conditions && Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key, index) => `"${key}" = $${index + 1}`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    const result = await db.query(query, values);
    return result.rows;
  }

  static async findById(id: number): Promise<any | null> {
    const result = await db.query(
      `SELECT * FROM "${this.tableName}" WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(data: Record<string, any>): Promise<any> {
    const columns = Object.keys(data).map(key => `"${key}"`).join(', ');
    const placeholders = Object.keys(data).map((_, index) => `$${index + 1}`).join(', ');
    const values = Object.values(data);

    const query = `
      INSERT INTO "${this.tableName}" (${columns}) 
      VALUES (${placeholders}) 
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async update(id: number, data: Record<string, any>): Promise<any | null> {
    const setClause = Object.keys(data)
      .map((key, index) => `"${key}" = $${index + 2}`)
      .join(', ');
    const values = [id, ...Object.values(data)];

    const query = `
      UPDATE "${this.tableName}" 
      SET ${setClause} 
      WHERE id = $1 
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.query(
      `DELETE FROM "${this.tableName}" WHERE id = $1`,
      [id]
    );
    return result.rowCount > 0;
  }

  // Método para executar queries customizadas
  static async query(sql: string, params: any[] = []): Promise<any> {
    return await db.query(sql, params);
  }
}

// Decorators para facilitar a definição de modelos
export function Table(name: string) {
  return function <T extends typeof BaseModel>(constructor: T) {
    constructor.setTableName(name);
    return constructor;
  };
}

export function Field(definition: FieldDefinition) {
  return function (target: any, propertyKey: string) {
    if (!target.constructor.fields) {
      target.constructor.fields = {};
    }
    target.constructor.fields[propertyKey] = definition;
  };
}

export function Index(definition: Omit<IndexDefinition, 'name'>) {
  return function <T extends typeof BaseModel>(constructor: T) {
    const indexName = `idx_${constructor.tableName}_${definition.columns.join('_')}`;
    constructor.defineIndex({ ...definition, name: indexName });
    return constructor;
  };
}