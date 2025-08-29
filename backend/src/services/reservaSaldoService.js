const db = require('../database');

/**
 * Serviço para gerenciar reservas de saldo de contratos
 * Implementa o sistema de reserva automática no momento do pedido
 * e conversão da reserva em consumo no recebimento
 */
class ReservaSaldoService {
  
  /**
   * Reserva saldo para um pedido
   * @param {Array} itens - Array de itens do pedido [{contrato_produto_id, quantidade, preco_unitario}]
   * @param {number} usuarioId - ID do usuário que está fazendo o pedido
   * @param {string} documentoReferencia - Referência do pedido
   * @returns {Promise<Object>} Resultado da reserva
   */
  async reservarSaldoPedido(itens, usuarioId, documentoReferencia) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const reservasRealizadas = [];
      const errosValidacao = [];
      
      for (const item of itens) {
        const { contrato_produto_id, quantidade, preco_unitario } = item;
        
        // Verificar saldo disponível
        const saldoResult = await client.query(`
          SELECT 
            quantidade_disponivel_real,
            status,
            produto_nome,
            contrato_numero
          FROM view_saldo_contratos_itens 
          WHERE contrato_produto_id = $1
        `, [contrato_produto_id]);
        
        if (saldoResult.rows.length === 0) {
          errosValidacao.push({
            contrato_produto_id,
            erro: 'Item de contrato não encontrado'
          });
          continue;
        }
        
        const saldo = saldoResult.rows[0];
        
        // Verificar se há saldo suficiente
        if (saldo.quantidade_disponivel_real < quantidade) {
          errosValidacao.push({
            contrato_produto_id,
            produto: saldo.produto_nome,
            contrato: saldo.contrato_numero,
            quantidade_solicitada: quantidade,
            quantidade_disponivel: saldo.quantidade_disponivel_real,
            erro: 'Saldo insuficiente para reserva'
          });
          continue;
        }
        
        // Verificar se o contrato não está esgotado
        if (saldo.status === 'ESGOTADO') {
          errosValidacao.push({
            contrato_produto_id,
            produto: saldo.produto_nome,
            contrato: saldo.contrato_numero,
            erro: 'Contrato esgotado'
          });
          continue;
        }
        
        // Realizar a reserva
        const valorUtilizado = quantidade * (preco_unitario || 0);
        
        const reservaResult = await client.query(`
          INSERT INTO movimentacoes_consumo_contratos (
            contrato_produto_id,
            tipo,
            quantidade_utilizada,
            valor_utilizado,
            justificativa,
            data_movimentacao,
            usuario_id,
            documento_referencia
          ) VALUES ($1, 'RESERVA', $2, $3, $4, CURRENT_DATE, $5, $6)
          RETURNING id
        `, [
          contrato_produto_id,
          quantidade,
          valorUtilizado,
          `Reserva automática para pedido ${documentoReferencia}`,
          usuarioId,
          documentoReferencia
        ]);
        
        reservasRealizadas.push({
          movimentacao_id: reservaResult.rows[0].id,
          contrato_produto_id,
          quantidade_reservada: quantidade,
          valor_reservado: valorUtilizado,
          produto: saldo.produto_nome,
          contrato: saldo.contrato_numero
        });
      }
      
      // Se houver erros de validação, reverter transação
      if (errosValidacao.length > 0) {
        await client.query('ROLLBACK');
        return {
          sucesso: false,
          erros: errosValidacao,
          reservas: []
        };
      }
      
      await client.query('COMMIT');
      
      return {
        sucesso: true,
        erros: [],
        reservas: reservasRealizadas
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao reservar saldo:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Converte reserva em consumo efetivo (chamado no recebimento)
   * @param {string} documentoReferencia - Referência do pedido
   * @param {Array} itensRecebidos - Itens efetivamente recebidos [{contrato_produto_id, quantidade_recebida}]
   * @param {number} usuarioId - ID do usuário que está registrando o recebimento
   * @returns {Promise<Object>} Resultado da conversão
   */
  async converterReservaEmConsumo(documentoReferencia, itensRecebidos, usuarioId) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const consumosRegistrados = [];
      const liberacoesRealizadas = [];
      
      // Buscar reservas ativas para este documento
      const reservasResult = await client.query(`
        SELECT 
          id,
          contrato_produto_id,
          quantidade_utilizada as quantidade_reservada,
          valor_utilizado as valor_reservado
        FROM movimentacoes_consumo_contratos
        WHERE documento_referencia = $1 
          AND tipo = 'RESERVA'
      `, [documentoReferencia]);
      
      const reservasAtivas = reservasResult.rows;
      
      for (const itemRecebido of itensRecebidos) {
        const { contrato_produto_id, quantidade_recebida } = itemRecebido;
        
        // Encontrar a reserva correspondente
        const reserva = reservasAtivas.find(r => r.contrato_produto_id === contrato_produto_id);
        
        if (!reserva) {
          console.warn(`Reserva não encontrada para contrato_produto_id ${contrato_produto_id}`);
          continue;
        }
        
        const quantidadeReservada = parseFloat(reserva.quantidade_reservada);
        const valorReservado = parseFloat(reserva.valor_reservado || 0);
        
        // Calcular proporções
        const proporcaoRecebida = quantidade_recebida / quantidadeReservada;
        const valorConsumido = valorReservado * proporcaoRecebida;
        
        // Registrar consumo efetivo
        const consumoResult = await client.query(`
          INSERT INTO movimentacoes_consumo_contratos (
            contrato_produto_id,
            tipo,
            quantidade_utilizada,
            valor_utilizado,
            justificativa,
            data_movimentacao,
            usuario_id,
            documento_referencia
          ) VALUES ($1, 'CONSUMO', $2, $3, $4, CURRENT_DATE, $5, $6)
          RETURNING id
        `, [
          contrato_produto_id,
          quantidade_recebida,
          valorConsumido,
          `Consumo efetivo do pedido ${documentoReferencia}`,
          usuarioId,
          documentoReferencia
        ]);
        
        consumosRegistrados.push({
          movimentacao_id: consumoResult.rows[0].id,
          contrato_produto_id,
          quantidade_consumida: quantidade_recebida,
          valor_consumido: valorConsumido
        });
        
        // Liberar o restante da reserva se houver
        const quantidadeALiberar = quantidadeReservada - quantidade_recebida;
        if (quantidadeALiberar > 0) {
          const valorALiberar = valorReservado - valorConsumido;
          
          const liberacaoResult = await client.query(`
            INSERT INTO movimentacoes_consumo_contratos (
              contrato_produto_id,
              tipo,
              quantidade_utilizada,
              valor_utilizado,
              justificativa,
              data_movimentacao,
              usuario_id,
              documento_referencia
            ) VALUES ($1, 'LIBERACAO_RESERVA', $2, $3, $4, CURRENT_DATE, $5, $6)
            RETURNING id
          `, [
            contrato_produto_id,
            quantidadeALiberar,
            valorALiberar,
            `Liberação de reserva não utilizada do pedido ${documentoReferencia}`,
            usuarioId,
            documentoReferencia
          ]);
          
          liberacoesRealizadas.push({
            movimentacao_id: liberacaoResult.rows[0].id,
            contrato_produto_id,
            quantidade_liberada: quantidadeALiberar,
            valor_liberado: valorALiberar
          });
        }
      }
      
      await client.query('COMMIT');
      
      return {
        sucesso: true,
        consumos: consumosRegistrados,
        liberacoes: liberacoesRealizadas
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao converter reserva em consumo:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Cancela reservas de um pedido (em caso de cancelamento)
   * @param {string} documentoReferencia - Referência do pedido
   * @param {number} usuarioId - ID do usuário que está cancelando
   * @returns {Promise<Object>} Resultado do cancelamento
   */
  async cancelarReservasPedido(documentoReferencia, usuarioId) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Buscar reservas ativas
      const reservasResult = await client.query(`
        SELECT 
          id,
          contrato_produto_id,
          quantidade_utilizada as quantidade_reservada,
          valor_utilizado as valor_reservado
        FROM movimentacoes_consumo_contratos
        WHERE documento_referencia = $1 
          AND tipo = 'RESERVA'
      `, [documentoReferencia]);
      
      const cancelamentosRealizados = [];
      
      for (const reserva of reservasResult.rows) {
        // Registrar liberação da reserva
        const liberacaoResult = await client.query(`
          INSERT INTO movimentacoes_consumo_contratos (
            contrato_produto_id,
            tipo,
            quantidade_utilizada,
            valor_utilizado,
            justificativa,
            data_movimentacao,
            usuario_id,
            documento_referencia
          ) VALUES ($1, 'LIBERACAO_RESERVA', $2, $3, $4, CURRENT_DATE, $5, $6)
          RETURNING id
        `, [
          reserva.contrato_produto_id,
          reserva.quantidade_reservada,
          reserva.valor_reservado,
          `Cancelamento do pedido ${documentoReferencia}`,
          usuarioId,
          documentoReferencia
        ]);
        
        cancelamentosRealizados.push({
          movimentacao_id: liberacaoResult.rows[0].id,
          contrato_produto_id: reserva.contrato_produto_id,
          quantidade_liberada: reserva.quantidade_reservada,
          valor_liberado: reserva.valor_reservado
        });
      }
      
      await client.query('COMMIT');
      
      return {
        sucesso: true,
        cancelamentos: cancelamentosRealizados
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao cancelar reservas:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Consulta reservas ativas por documento
   * @param {string} documentoReferencia - Referência do pedido
   * @returns {Promise<Array>} Lista de reservas ativas
   */
  async consultarReservasAtivas(documentoReferencia) {
    try {
      const result = await db.query(`
        SELECT 
          mcc.id,
          mcc.contrato_produto_id,
          mcc.quantidade_utilizada as quantidade_reservada,
          mcc.valor_utilizado as valor_reservado,
          mcc.data_movimentacao,
          vsci.produto_nome,
          vsci.contrato_numero,
          vsci.quantidade_disponivel_real
        FROM movimentacoes_consumo_contratos mcc
        JOIN view_saldo_contratos_itens vsci ON mcc.contrato_produto_id = vsci.contrato_produto_id
        WHERE mcc.documento_referencia = $1 
          AND mcc.tipo = 'RESERVA'
        ORDER BY mcc.data_movimentacao DESC
      `, [documentoReferencia]);
      
      return result.rows;
    } catch (error) {
      console.error('Erro ao consultar reservas ativas:', error);
      throw error;
    }
  }
}

module.exports = new ReservaSaldoService();