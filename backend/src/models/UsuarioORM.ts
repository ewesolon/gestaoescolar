import { BaseModel } from '../orm/BaseModel';
import { Model } from '../orm/Migration';
import bcrypt from 'bcryptjs';

// Interface para o Usuário
export interface IUsuario {
  id?: number;
  nome: string;
  email: string;
  senha?: string; // Opcional para retorno (não incluir senha em responses)
  tipo: 'admin' | 'gestor' | 'operador';
  ativo: boolean;
  ultimo_login?: Date;
  created_at?: Date;
  updated_at?: Date;
}

// Modelo Usuario usando ORM
@Model('usuarios')
export class UsuarioORM extends BaseModel {
  // Definir campos da tabela
  static fields = {
    id: {
      type: 'SERIAL' as const,
      primaryKey: true
    },
    nome: {
      type: 'VARCHAR' as const,
      length: 255,
      nullable: false
    },
    email: {
      type: 'VARCHAR' as const,
      length: 255,
      nullable: false,
      unique: true
    },
    senha: {
      type: 'VARCHAR' as const,
      length: 255,
      nullable: false
    },
    tipo: {
      type: 'VARCHAR' as const,
      length: 20,
      nullable: false,
      default: 'operador'
    },
    ativo: {
      type: 'BOOLEAN' as const,
      nullable: false,
      default: true
    },
    ultimo_login: {
      type: 'TIMESTAMP' as const,
      nullable: true
    },
    created_at: {
      type: 'TIMESTAMP' as const,
      nullable: false,
      default: 'CURRENT_TIMESTAMP'
    },
    updated_at: {
      type: 'TIMESTAMP' as const,
      nullable: false,
      default: 'CURRENT_TIMESTAMP'
    }
  };

  // Índices
  static indexes = [
    {
      name: 'idx_usuarios_email',
      columns: ['email'],
      unique: true
    },
    {
      name: 'idx_usuarios_tipo',
      columns: ['tipo']
    }
  ];

  // Métodos específicos do Usuário
  static async findByEmail(email: string): Promise<IUsuario | null> {
    const usuarios = await this.findAll({ email });
    return usuarios[0] || null;
  }

  static async findActive(): Promise<IUsuario[]> {
    return await this.findAll({ ativo: true });
  }

  static async findByTipo(tipo: string): Promise<IUsuario[]> {
    return await this.findAll({ tipo });
  }

  static async createUsuario(usuario: Omit<IUsuario, 'id' | 'created_at' | 'updated_at'>): Promise<IUsuario> {
    // Hash da senha antes de salvar
    const senhaHash = await bcrypt.hash(usuario.senha!, 10);
    
    const usuarioData = {
      ...usuario,
      senha: senhaHash
    };
    
    const novoUsuario = await this.create(usuarioData);
    
    // Remover senha do retorno
    delete novoUsuario.senha;
    return novoUsuario;
  }

  static async updateUsuario(id: number, usuario: Partial<Omit<IUsuario, 'id' | 'created_at'>>): Promise<IUsuario | null> {
    const updateData: any = {
      ...usuario,
      updated_at: new Date()
    };
    
    // Hash da senha se fornecida
    if (updateData.senha) {
      updateData.senha = await bcrypt.hash(updateData.senha, 10);
    }
    
    const usuarioAtualizado = await this.update(id, updateData);
    
    if (usuarioAtualizado) {
      // Remover senha do retorno
      delete usuarioAtualizado.senha;
    }
    
    return usuarioAtualizado;
  }

  static async deactivateUsuario(id: number): Promise<IUsuario | null> {
    return await this.updateUsuario(id, { ativo: false });
  }

  static async activateUsuario(id: number): Promise<IUsuario | null> {
    return await this.updateUsuario(id, { ativo: true });
  }

  static async updateLastLogin(id: number): Promise<void> {
    await this.update(id, { ultimo_login: new Date(), updated_at: new Date() });
  }

  static async validatePassword(email: string, senha: string): Promise<IUsuario | null> {
    const db = require('../database').default;
    
    // Buscar usuário com senha
    const result = await db.query(
      `SELECT * FROM "${this.tableName}" WHERE email = $1 AND ativo = true`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const usuario = result.rows[0];
    
    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return null;
    }
    
    // Atualizar último login
    await this.updateLastLogin(usuario.id);
    
    // Remover senha do retorno
    delete usuario.senha;
    return usuario;
  }

  static async changePassword(id: number, senhaAtual: string, novaSenha: string): Promise<boolean> {
    const db = require('../database').default;
    
    // Buscar usuário com senha atual
    const result = await db.query(
      `SELECT senha FROM "${this.tableName}" WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return false;
    }
    
    const usuario = result.rows[0];
    
    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    
    if (!senhaValida) {
      return false;
    }
    
    // Atualizar com nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    await this.update(id, { 
      senha: novaSenhaHash, 
      updated_at: new Date() 
    });
    
    return true;
  }

  // Método para busca com filtros avançados
  static async search(filters: {
    nome?: string;
    email?: string;
    tipo?: string;
    ativo?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<IUsuario[]> {
    let query = `SELECT id, nome, email, tipo, ativo, ultimo_login, created_at, updated_at FROM "${this.tableName}"`;
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Construir condições WHERE
    if (filters.nome) {
      conditions.push(`nome ILIKE $${paramIndex}`);
      values.push(`%${filters.nome}%`);
      paramIndex++;
    }

    if (filters.email) {
      conditions.push(`email ILIKE $${paramIndex}`);
      values.push(`%${filters.email}%`);
      paramIndex++;
    }

    if (filters.tipo) {
      conditions.push(`tipo = $${paramIndex}`);
      values.push(filters.tipo);
      paramIndex++;
    }

    if (filters.ativo !== undefined) {
      conditions.push(`ativo = $${paramIndex}`);
      values.push(filters.ativo);
      paramIndex++;
    }

    // Adicionar WHERE se houver condições
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Ordenação
    query += ' ORDER BY nome ASC';

    // Paginação
    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      values.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex}`;
      values.push(filters.offset);
    }

    const result = await this.query(query, values);
    return result.rows;
  }

  // Método auxiliar para executar queries customizadas
  private static async query(sql: string, params: any[] = []): Promise<any> {
    const db = require('../database').default;
    return await db.query(sql, params);
  }
}

// Exportar interface e classe
export { IUsuario };
export default UsuarioORM;