// Controller de fornecedores para PostgreSQL
import { Request, Response } from "express";
const db = require("../database");

// Função para validar CNPJ (completa)
function validarCNPJ(cnpj: string): boolean {
  if (!cnpj) return false;
  
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
  
  // Verificar se tem 14 dígitos
  if (cnpjLimpo.length !== 14) return false;
  
  // Verificar se não são todos os dígitos iguais
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;
  
  // Validar dígitos verificadores
  let soma = 0;
  let peso = 2;
  
  // Primeiro dígito verificador
  for (let i = 11; i >= 0; i--) {
    soma += parseInt(cnpjLimpo[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  
  let digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (parseInt(cnpjLimpo[12]) !== digito1) return false;
  
  // Segundo dígito verificador
  soma = 0;
  peso = 2;
  
  for (let i = 12; i >= 0; i--) {
    soma += parseInt(cnpjLimpo[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  
  let digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return parseInt(cnpjLimpo[13]) === digito2;
}

// Função para validar CPF (completa)
function validarCPF(cpf: string): boolean {
  if (!cpf) return false;
  
  const cpfLimpo = cpf.replace(/[^\d]/g, '');
  
  // Verificar se tem 11 dígitos
  if (cpfLimpo.length !== 11) return false;
  
  // Verificar se não são todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
  
  // Validar primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo[i]) * (10 - i);
  }
  let digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (parseInt(cpfLimpo[9]) !== digito1) return false;
  
  // Validar segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo[i]) * (11 - i);
  }
  let digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return parseInt(cpfLimpo[10]) === digito2;
}

// Função para validar CNPJ ou CPF
function validarDocumento(documento: string): { valido: boolean; tipo: 'CNPJ' | 'CPF' | null; erro?: string } {
  if (!documento || typeof documento !== 'string') {
    return { valido: false, tipo: null, erro: 'Documento é obrigatório' };
  }
  
  const documentoLimpo = documento.replace(/[^\d]/g, '');
  
  if (documentoLimpo.length === 14) {
    // É um CNPJ
    if (validarCNPJ(documento)) {
      return { valido: true, tipo: 'CNPJ' };
    } else {
      return { valido: false, tipo: 'CNPJ', erro: 'CNPJ inválido - verifique os dígitos verificadores' };
    }
  } else if (documentoLimpo.length === 11) {
    // É um CPF
    if (validarCPF(documento)) {
      return { valido: true, tipo: 'CPF' };
    } else {
      return { valido: false, tipo: 'CPF', erro: 'CPF inválido - verifique os dígitos verificadores' };
    }
  } else {
    return { valido: false, tipo: null, erro: 'Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)' };
  }
}

// Função para validar email
function validarEmail(email: string): boolean {
  if (!email) return true; // Email é opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Função para validar telefone
function validarTelefone(telefone: string): boolean {
  if (!telefone) return true; // Telefone é opcional
  const telefoneLimpo = telefone.replace(/[^\d]/g, '');
  return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11;
}

// Função para validar CEP
function validarCEP(cep: string): boolean {
  if (!cep) return true; // CEP é opcional
  const cepLimpo = cep.replace(/[^\d]/g, '');
  return cepLimpo.length === 8;
}

export async function listarFornecedores(req: Request, res: Response) {
  try {
    const { ativo, busca, page = 1, limit = 50 } = req.query;
    
    let whereClause = '1=1';
    const params: any[] = [];
    let paramCount = 0;
    
    // Filtro por status ativo
    if (ativo !== undefined) {
      paramCount++;
      whereClause += ` AND f.ativo = $${paramCount}`;
      params.push(ativo === 'true');
    }
    
    // Filtro de busca por nome ou CNPJ
    if (busca) {
      paramCount++;
      whereClause += ` AND (f.nome ILIKE $${paramCount} OR f.cnpj ILIKE $${paramCount})`;
      params.push(`%${busca}%`);
    }
    
    // Paginação
    const offset = (Number(page) - 1) * Number(limit);
    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;
    params.push(Number(limit), offset);
    
    const fornecedores = await db.all(`
      SELECT 
        f.id,
        f.nome,
        f.cnpj,
        f.email,
        f.telefone,
        f.endereco,
        f.cidade,
        f.estado,
        f.cep,
        f.ativo,

        f.created_at,
        COUNT(c.id) as total_contratos,
        COALESCE(SUM(CASE WHEN c.ativo = true THEN 1 ELSE 0 END), 0) as contratos_ativos
      FROM fornecedores f
      LEFT JOIN contratos c ON f.id = c.fornecedor_id
      WHERE ${whereClause}
      GROUP BY f.id, f.nome, f.cnpj, f.email, f.telefone, f.endereco, f.cidade, f.estado, f.cep, f.ativo, f.created_at
      ORDER BY f.nome
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `, params);

    // Contar total para paginação
    const totalResult = await db.get(`
      SELECT COUNT(DISTINCT f.id) as total 
      FROM fornecedores f
      LEFT JOIN contratos c ON f.id = c.fornecedor_id
      WHERE ${whereClause}
    `, params.slice(0, -2)); // Remove limit e offset

    res.json({
      success: true,
      data: fornecedores,
      total: Number(totalResult.total),
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(Number(totalResult.total) / Number(limit))
    });
  } catch (error) {
    console.error("❌ Erro ao listar fornecedores:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao listar fornecedores",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function buscarFornecedor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const fornecedor = await db.get(`
      SELECT * FROM fornecedores WHERE id = $1
    `, [id]);

    if (!fornecedor) {
      return res.status(404).json({
        success: false,
        message: "Fornecedor não encontrado"
      });
    }

    res.json({
      success: true,
      data: fornecedor
    });
  } catch (error) {
    console.error("❌ Erro ao buscar fornecedor:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar fornecedor",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function criarFornecedor(req: Request, res: Response) {
  try {
    const {
      nome,
      cnpj,
      email,
      telefone,
      endereco,
      cidade,
      estado,
      cep,
      observacoes,
      ativo = true
    } = req.body;

    console.log('📝 Criando fornecedor:', { nome, cnpj, email, telefone });

    // Array para coletar erros de validação
    const erros: string[] = [];

    // Validação do nome
    if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
      erros.push('Nome é obrigatório e deve ter pelo menos 3 caracteres');
    }

    // Validação do documento (CNPJ ou CPF)
    const validacaoDoc = validarDocumento(cnpj);
    if (!validacaoDoc.valido) {
      erros.push(validacaoDoc.erro || 'Documento inválido');
    }

    // Validação do email (opcional)
    if (email && !validarEmail(email)) {
      erros.push('Email deve ter formato válido');
    }

    // Validação do telefone (opcional)
    if (telefone && !validarTelefone(telefone)) {
      erros.push('Telefone deve ter entre 10 e 11 dígitos');
    }

    // Validação do CEP (opcional)
    if (cep && !validarCEP(cep)) {
      erros.push('CEP deve ter 8 dígitos');
    }

    // Validação do estado (opcional)
    if (estado && (typeof estado !== 'string' || estado.length !== 2)) {
      erros.push('Estado deve ter 2 caracteres (ex: SP, RJ)');
    }

    // Se há erros de validação, retornar todos
    if (erros.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: erros
      });
    }

    // Limpar e formatar dados
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    const telefoneLimpo = telefone ? telefone.replace(/[^\d]/g, '') : null;
    const cepLimpo = cep ? cep.replace(/[^\d]/g, '') : null;
    const estadoUpper = estado ? estado.toUpperCase() : null;

    // Verificar se CNPJ já existe
    const cnpjExistente = await db.get(`
      SELECT id, nome FROM fornecedores WHERE cnpj = $1
    `, [cnpjLimpo]);

    if (cnpjExistente) {
      return res.status(409).json({
        success: false,
        message: `CNPJ já cadastrado no sistema para o fornecedor: ${cnpjExistente.nome}`,
        conflictData: {
          id: cnpjExistente.id,
          nome: cnpjExistente.nome,
          cnpj: cnpjLimpo
        }
      });
    }

    // Inserir fornecedor
    const result = await db.query(`
      INSERT INTO fornecedores (
        nome, cnpj, email, telefone, endereco, cidade, estado, cep, 
        observacoes, ativo, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      nome.trim(),
      cnpjLimpo,
      email ? email.trim().toLowerCase() : null,
      telefoneLimpo,
      endereco ? endereco.trim() : null,
      cidade ? cidade.trim() : null,
      estadoUpper,
      cepLimpo,
      observacoes ? observacoes.trim() : null,
      ativo
    ]);

    console.log('✅ Fornecedor criado com sucesso:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: "Fornecedor criado com sucesso",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Erro ao criar fornecedor:", error);
    
    // Tratar erros específicos do PostgreSQL
    if (error instanceof Error) {
      if (error.message.includes('duplicate key value violates unique constraint')) {
        return res.status(409).json({
          success: false,
          message: "CNPJ já cadastrado no sistema",
          error: 'Constraint violation'
        });
      }
      
      if (error.message.includes('violates not-null constraint')) {
        return res.status(400).json({
          success: false,
          message: "Campos obrigatórios não preenchidos",
          error: error.message
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao criar fornecedor",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function editarFornecedor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      nome,
      cnpj,
      email,
      telefone,
      endereco,
      cidade,
      estado,
      cep,
      observacoes,
      ativo
    } = req.body;

    console.log('📝 Editando fornecedor:', { id, nome, cnpj, email, telefone });

    // Verificar se o fornecedor existe
    const fornecedorExistente = await db.get(`
      SELECT id, cnpj FROM fornecedores WHERE id = $1
    `, [id]);

    if (!fornecedorExistente) {
      return res.status(404).json({
        success: false,
        message: "Fornecedor não encontrado"
      });
    }

    // Array para coletar erros de validação
    const erros: string[] = [];

    // Validação do nome
    if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
      erros.push('Nome é obrigatório e deve ter pelo menos 3 caracteres');
    }

    // Validação do documento (CNPJ ou CPF)
    const validacaoDoc = validarDocumento(cnpj);
    if (!validacaoDoc.valido) {
      erros.push(validacaoDoc.erro || 'Documento inválido');
    }

    // Validação do email (opcional)
    if (email && !validarEmail(email)) {
      erros.push('Email deve ter formato válido');
    }

    // Validação do telefone (opcional)
    if (telefone && !validarTelefone(telefone)) {
      erros.push('Telefone deve ter entre 10 e 11 dígitos');
    }

    // Validação do CEP (opcional)
    if (cep && !validarCEP(cep)) {
      erros.push('CEP deve ter 8 dígitos');
    }

    // Validação do estado (opcional)
    if (estado && (typeof estado !== 'string' || estado.length !== 2)) {
      erros.push('Estado deve ter 2 caracteres (ex: SP, RJ)');
    }

    // Se há erros de validação, retornar todos
    if (erros.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: erros
      });
    }

    // Limpar e formatar dados
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    const telefoneLimpo = telefone ? telefone.replace(/[^\d]/g, '') : null;
    const cepLimpo = cep ? cep.replace(/[^\d]/g, '') : null;
    const estadoUpper = estado ? estado.toUpperCase() : null;

    // Verificar se CNPJ já existe em outro fornecedor
    if (cnpjLimpo !== fornecedorExistente.cnpj) {
      const cnpjConflito = await db.get(`
        SELECT id, nome FROM fornecedores WHERE cnpj = $1 AND id != $2
      `, [cnpjLimpo, id]);

      if (cnpjConflito) {
        return res.status(409).json({
          success: false,
          message: `CNPJ já cadastrado no sistema para o fornecedor: ${cnpjConflito.nome}`,
          conflictData: {
            id: cnpjConflito.id,
            nome: cnpjConflito.nome,
            cnpj: cnpjLimpo
          }
        });
      }
    }

    // Atualizar fornecedor
    const result = await db.query(`
      UPDATE fornecedores SET
        nome = $1,
        cnpj = $2,
        email = $3,
        telefone = $4,
        endereco = $5,
        cidade = $6,
        estado = $7,
        cep = $8,
        observacoes = $9,
        ativo = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `, [
      nome.trim(),
      cnpjLimpo,
      email ? email.trim().toLowerCase() : null,
      telefoneLimpo,
      endereco ? endereco.trim() : null,
      cidade ? cidade.trim() : null,
      estadoUpper,
      cepLimpo,
      observacoes ? observacoes.trim() : null,
      ativo,
      id
    ]);

    console.log('✅ Fornecedor atualizado com sucesso:', id);

    res.json({
      success: true,
      message: "Fornecedor atualizado com sucesso",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Erro ao editar fornecedor:", error);
    
    // Tratar erros específicos do PostgreSQL
    if (error instanceof Error) {
      if (error.message.includes('duplicate key value violates unique constraint')) {
        return res.status(409).json({
          success: false,
          message: "CNPJ já cadastrado no sistema",
          error: 'Constraint violation'
        });
      }
      
      if (error.message.includes('violates not-null constraint')) {
        return res.status(400).json({
          success: false,
          message: "Campos obrigatórios não preenchidos",
          error: error.message
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao editar fornecedor",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function verificarRelacionamentosFornecedor(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Verificar se o fornecedor existe
    const fornecedor = await db.get(`
      SELECT nome FROM fornecedores WHERE id = $1
    `, [id]);

    if (!fornecedor) {
      return res.status(404).json({
        success: false,
        message: "Fornecedor não encontrado"
      });
    }

    // Verificar contratos vinculados com detalhes
    const contratos = await db.all(`
      SELECT 
        c.id,
        c.numero,
        c.status,
        c.data_inicio,
        c.data_fim,
        c.valor_total,
        c.created_at
      FROM contratos c
      WHERE c.fornecedor_id = $1
      ORDER BY c.created_at DESC
    `, [id]);

    // Para cada contrato, contar produtos separadamente
    for (let contrato of contratos) {
      const produtosCount = await db.get(`
        SELECT COUNT(*) as total
        FROM contrato_produtos 
        WHERE contrato_id = $1
      `, [contrato.id]);
      contrato.total_produtos = produtosCount.total || 0;
    }

    const totalContratos = contratos.length;
    const contratosAtivos = contratos.filter(c => c.status === 'ativo').length;

    res.json({
      success: true,
      data: {
        fornecedor: fornecedor.nome,
        totalContratos,
        contratosAtivos,
        contratos: contratos.map(c => ({
          id: c.id,
          numero: c.numero,
          status: c.status,
          dataInicio: c.data_inicio,
          dataFim: c.data_fim,
          valorTotal: c.valor_total,
          totalProdutos: c.total_produtos
        })),
        podeExcluir: totalContratos === 0
      }
    });
  } catch (error) {
    console.error("❌ Erro ao verificar relacionamentos:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao verificar relacionamentos",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function removerFornecedor(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Verificar se há contratos vinculados
    const contratosVinculados = await db.get(`
      SELECT COUNT(*) as total FROM contratos WHERE fornecedor_id = $1
    `, [id]);

    if (Number(contratosVinculados.total) > 0) {
      // Buscar detalhes dos contratos para resposta mais informativa
      const contratos = await db.all(`
        SELECT numero, status FROM contratos WHERE fornecedor_id = $1 LIMIT 5
      `, [id]);

      return res.status(409).json({
        success: false,
        message: `Não é possível remover fornecedor. Existem ${contratosVinculados.total} contratos vinculados.`,
        details: {
          totalContratos: Number(contratosVinculados.total),
          exemplosContratos: contratos.map(c => `${c.numero} (${c.status})`),
          sugestao: "Remova ou transfira os contratos antes de excluir o fornecedor"
        }
      });
    }

    const result = await db.query(`
      DELETE FROM fornecedores WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Fornecedor não encontrado"
      });
    }

    res.json({
      success: true,
      message: "Fornecedor removido com sucesso"
    });
  } catch (error) {
    console.error("❌ Erro ao remover fornecedor:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao remover fornecedor",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function buscarContratosFornecedor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    let whereClause = 'c.fornecedor_id = $1';
    const params: any[] = [id];
    
    if (status) {
      params.push(status);
      whereClause += ` AND c.status = $${params.length}`;
    }
    
    const contratos = await db.all(`
      SELECT 
        c.id,
        c.numero,
        c.data_inicio,
        c.data_fim,
        c.valor_total,
        c.status,
        c.descricao,
        c.objeto,
        c.modalidade,
        COUNT(cp.id) as total_produtos,
        COUNT(a.id) as total_aditivos
      FROM contratos c
      LEFT JOIN contrato_produtos cp ON c.id = cp.contrato_id
      LEFT JOIN aditivos_contratos a ON c.id = a.contrato_id AND a.ativo = true
      WHERE ${whereClause}
      GROUP BY c.id, c.numero, c.data_inicio, c.data_fim, c.valor_total, c.status, c.descricao, c.objeto, c.modalidade
      ORDER BY c.created_at DESC
    `, params);

    res.json({
      success: true,
      data: contratos,
      total: contratos.length
    });
  } catch (error) {
    console.error("❌ Erro ao buscar contratos do fornecedor:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar contratos do fornecedor",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function importarFornecedoresLote(req: Request, res: Response) {
  try {
    const { fornecedores } = req.body;

    if (!Array.isArray(fornecedores) || fornecedores.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Lista de fornecedores inválida"
      });
    }

    let sucessos = 0;
    let erros = 0;
    let atualizacoes = 0;
    let insercoes = 0;
    const resultados = [];

    for (const fornecedor of fornecedores) {
      try {
        const {
          nome,
          cnpj,
          email,
          telefone,
          endereco,
          cidade,
          estado,
          cep,

          observacoes,
          ativo = true
        } = fornecedor;

        // Validações robustas
        const errosItem: string[] = [];
        
        if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
          errosItem.push('Nome é obrigatório e deve ter pelo menos 3 caracteres');
        }
        
        const validacaoDoc = validarDocumento(cnpj);
        if (!validacaoDoc.valido) {
          errosItem.push(validacaoDoc.erro || 'Documento inválido');
        }
        
        if (email && !validarEmail(email)) {
          errosItem.push('Email deve ter formato válido');
        }
        
        if (telefone && !validarTelefone(telefone)) {
          errosItem.push('Telefone deve ter entre 10 e 11 dígitos');
        }
        
        if (cep && !validarCEP(cep)) {
          errosItem.push('CEP deve ter 8 dígitos');
        }
        
        if (estado && (typeof estado !== 'string' || estado.length !== 2)) {
          errosItem.push('Estado deve ter 2 caracteres (ex: SP, RJ)');
        }
        
        if (errosItem.length > 0) {
          throw new Error(errosItem.join('; '));
        }

        // Limpar e formatar dados
        const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
        const telefoneLimpo = telefone ? telefone.replace(/[^\d]/g, '') : null;
        const cepLimpo = cep ? cep.replace(/[^\d]/g, '') : null;
        const estadoUpper = estado ? estado.toUpperCase() : null;

        // Verificar se fornecedor já existe pelo CNPJ
        const fornecedorExistente = await db.get(`
          SELECT id FROM fornecedores WHERE cnpj = $1
        `, [cnpjLimpo]);

        const result = await db.query(`
          INSERT INTO fornecedores (
            nome, cnpj, email, telefone, endereco, cidade, estado, cep, 
            observacoes, ativo, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (cnpj) DO UPDATE SET
            nome = EXCLUDED.nome,
            email = EXCLUDED.email,
            telefone = EXCLUDED.telefone,
            endereco = EXCLUDED.endereco,
            cidade = EXCLUDED.cidade,
            estado = EXCLUDED.estado,
            cep = EXCLUDED.cep,
            observacoes = EXCLUDED.observacoes,
            ativo = EXCLUDED.ativo,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `, [
          nome.trim(),
          cnpjLimpo,
          email ? email.trim().toLowerCase() : null,
          telefoneLimpo,
          endereco ? endereco.trim() : null,
          cidade ? cidade.trim() : null,
          estadoUpper,
          cepLimpo,
          observacoes ? observacoes.trim() : null,
          ativo
        ]);

        const acao = fornecedorExistente ? 'atualizado' : 'inserido';
        if (fornecedorExistente) {
          atualizacoes++;
        } else {
          insercoes++;
        }

        resultados.push({
          sucesso: true,
          acao: acao,
          fornecedor: result.rows[0]
        });

        sucessos++;
      } catch (error) {
        console.error(`❌ Erro ao importar fornecedor ${fornecedor.nome}:`, error);
        resultados.push({
          sucesso: false,
          fornecedor: fornecedor.nome || fornecedor.cnpj,
          erro: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        erros++;
      }
    }

    const mensagem = `Importação concluída: ${insercoes} inseridos, ${atualizacoes} atualizados, ${erros} erros`;

    res.json({
      success: true,
      message: mensagem,
      resultados: {
        sucesso: sucessos,
        erros: erros,
        insercoes: insercoes,
        atualizacoes: atualizacoes,
        detalhes: resultados
      }
    });
  } catch (error) {
    console.error("❌ Erro na importação em lote:", error);
    res.status(500).json({
      success: false,
      message: "Erro na importação em lote",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}