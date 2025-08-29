import { Express } from 'express';


import carrinhoitensormRoutes from './carrinho-itens-ormRoutes';
import estoquelotesormRoutes from './estoque-lotes-ormRoutes';
import estoquemovimentacoesormRoutes from './estoque-movimentacoes-ormRoutes';
import historicosaldosormRoutes from './historico-saldos-ormRoutes';
import pedidoshistoricoormRoutes from './pedidos-historico-ormRoutes';
import pedidositensormRoutes from './pedidos-itens-ormRoutes';

import recebimentoitenscontroleormRoutes from './recebimento-itens-controle-ormRoutes';
import refeicoesormRoutes from './refeicoes-ormRoutes';

export function setupNewORMRoutes(app: Express) {

  app.use('/api/carrinho-itens-orm', carrinhoitensormRoutes);
  app.use('/api/estoque-lotes-orm', estoquelotesormRoutes);
  app.use('/api/estoque-movimentacoes-orm', estoquemovimentacoesormRoutes);
  app.use('/api/historico-saldos-orm', historicosaldosormRoutes);
  app.use('/api/pedidos-historico-orm', pedidoshistoricoormRoutes);
  app.use('/api/pedidos-itens-orm', pedidositensormRoutes);

  app.use('/api/recebimento-itens-controle-orm', recebimentoitenscontroleormRoutes);
  app.use('/api/refeicoes-orm', refeicoesormRoutes);
}

export default setupNewORMRoutes;
