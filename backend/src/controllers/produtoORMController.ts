import { Request, Response } from 'express';
import { ProdutoORM, IProduto } from '../orm/index';

// Listar todos os produtos
export async function listarProdutos(req: Request, res: Response) {
  try {
    const produtos = await ProdutoORM.findAll();
    
    res.json({
      success: true,
      data: produtos,
      total: produtos.length,
      message: 'Produtos listados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar produtos',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Buscar produto por ID
export async function buscarProdutoPorId(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const produto = await ProdutoORM.findById(parseInt(id));
    
    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: produto,
      message: 'Produto encontrado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produto',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Criar novo produto
export async function criarProduto(req: Request, res: Response) {
  try {
    const produtoData: Omit<IProduto, 'id' | 'created_at' | 'updated_at'> = req.body;
    
    // Validações básicas
    if (!produtoData.nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório'
      });
    }
    
    // Verificar se produto já existe
    const produtoExistente = await ProdutoORM.findByName(produtoData.nome);
    if (produtoExistente && produtoExistente.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Já existe um produto com este nome'
      });
    }
    
    const novoProduto = await ProdutoORM.createProduto(produtoData);
    
    res.status(201).json({
      success: true,
      data: novoProduto,
      message: 'Produto criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar produto',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Atualizar produto
export async function atualizarProduto(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const produtoData: Partial<Omit<IProduto, 'id' | 'created_at'>> = req.body;
    
    // Verificar se produto existe
    const produtoExistente = await ProdutoORM.findById(parseInt(id));
    if (!produtoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    // Se está alterando o nome, verificar duplicação
    if (produtoData.nome && produtoData.nome !== produtoExistente.nome) {
      const produtoComMesmoNome = await ProdutoORM.findByName(produtoData.nome);
      if (produtoComMesmoNome && produtoComMesmoNome.id !== parseInt(id)) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um produto com este nome'
        });
      }
    }
    
    const produtoAtualizado = await ProdutoORM.updateProduto(parseInt(id), produtoData);
    
    res.json({
      success: true,
      data: produtoAtualizado,
      message: 'Produto atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar produto',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Deletar produto
export async function deletarProduto(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Verificar se produto existe
    const produtoExistente = await ProdutoORM.findById(parseInt(id));
    if (!produtoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    const deletado = await ProdutoORM.deleteProduto(parseInt(id));
    
    if (deletado) {
      res.json({
        success: true,
        message: 'Produto deletado com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar produto'
      });
    }
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar produto',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Ativar/Desativar produto
export async function alternarStatusProduto(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { ativo } = req.body;
    
    if (typeof ativo !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Status ativo deve ser um valor booleano'
      });
    }
    
    const produto = ativo 
      ? await ProdutoORM.activateProduto(parseInt(id))
      : await ProdutoORM.deactivateProduto(parseInt(id));
    
    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: produto,
      message: `Produto ${ativo ? 'ativado' : 'desativado'} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao alterar status do produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar status do produto',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Buscar produtos ativos
export async function listarProdutosAtivos(req: Request, res: Response) {
  try {
    const produtos = await ProdutoORM.findActive();
    
    res.json({
      success: true,
      data: produtos,
      total: produtos.length,
      message: 'Produtos ativos listados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao listar produtos ativos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar produtos ativos',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Listar produtos por categoria
export async function listarPorCategoria(req: Request, res: Response) {
  try {
    const { categoria } = req.params;
    const produtos = await ProdutoORM.search({ categoria, ativo: true });
    
    res.json({
      success: true,
      data: produtos,
      total: produtos.length,
      message: 'Produtos por categoria listados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao listar produtos por categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar produtos por categoria',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Buscar produtos por unidade de medida
export async function listarPorUnidadeMedida(req: Request, res: Response) {
  try {
    const { unidade_medida } = req.params;
    const produtos = await ProdutoORM.search({ unidade_medida, ativo: true });
    
    res.json({
      success: true,
      data: produtos,
      total: produtos.length,
      message: `Produtos com unidade de medida '${unidade_medida}' listados com sucesso`
    });
  } catch (error) {
    console.error('Erro ao listar produtos por unidade de medida:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar produtos por unidade de medida',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Buscar produtos com filtros avançados
export async function buscarProdutos(req: Request, res: Response) {
  try {
    const {
      nome,
      unidade,
      perecivel,
      ativo,
      limit = 50,
      offset = 0
    } = req.query;
    
    const filtros: any = {};
    
    if (nome) filtros.nome = nome as string;
    if (unidade) filtros.unidade = unidade as string;
    if (perecivel !== undefined) filtros.perecivel = perecivel === 'true';
    if (ativo !== undefined) filtros.ativo = ativo === 'true';
    if (limit) filtros.limit = parseInt(limit as string);
    if (offset) filtros.offset = parseInt(offset as string);
    
    const produtos = await ProdutoORM.search(filtros);
    
    res.json({
      success: true,
      data: produtos,
      total: produtos.length,
      filters: filtros,
      message: 'Busca realizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar produtos com filtros:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos com filtros',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}