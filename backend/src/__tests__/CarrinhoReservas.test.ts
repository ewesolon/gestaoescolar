import request from 'supertest';
import { app } from '../app'; // Assuming your express app instance is exported from app.ts
import db from '../database';

describe('Cart Reservation System', () => {
  let userId: number;
  let contratoId: number;
  let produtoId: number;

  beforeAll(async () => {
    // Setup: Create a user, a contract, and a product for testing
    const userResult = await db.query(
      "INSERT INTO usuarios (nome, email, senha, role) VALUES ('Test User', 'test@example.com', 'password', 'user') RETURNING id"
    );
    userId = userResult.rows[0].id;

    const produtoResult = await db.query(
      "INSERT INTO produtos (nome, unidade_medida, valor_unitario) VALUES ('Test Product', 'kg', 10.00) RETURNING id"
    );
    produtoId = produtoResult.rows[0].id;

    const contratoResult = await db.query(
      "INSERT INTO contratos (nome, status) VALUES ('Test Contract', 'ativo') RETURNING id"
    );
    contratoId = contratoResult.rows[0].id;

    await db.query(
      "INSERT INTO contratos_itens (contrato_id, produto_id, limite) VALUES ($1, $2, 100)",
      [contratoId, produtoId]
    );
  });

  afterAll(async () => {
    // Teardown: Clean up the database
    await db.query("DELETE FROM movimentacoes_consumo_contratos");
    await db.query("DELETE FROM carrinho_itens");
    await db.query("DELETE FROM carrinhos");
    await db.query("DELETE FROM contratos_itens");
    await db.query("DELETE FROM contratos");
    await db.query("DELETE FROM produtos");
    await db.query("DELETE FROM usuarios");
    await db.end();
  });

  it('should reserve stock when adding an item to the cart', async () => {
    const response = await request(app)
      .post('/api/carrinho/adicionar')
      .send({
        userId,
        produtoId,
        contratoId,
        quantidade: 10,
      });

    expect(response.status).toBe(201);

    const reserva = await db.query(
      "SELECT * FROM movimentacoes_consumo_contratos WHERE contrato_id = $1 AND produto_id = $2 AND tipo_movimentacao = 'RESERVA'",
      [contratoId, produtoId]
    );

    expect(reserva.rows.length).toBe(1);
    expect(reserva.rows[0].quantidade).toBe(10);
  });

  it('should update reservation when changing item quantity', async () => {
    // First, add an item
    await request(app)
      .post('/api/carrinho/adicionar')
      .send({ userId, produtoId, contratoId, quantidade: 5 });

    const carrinhoItem = await db.query("SELECT id FROM carrinho_itens WHERE produto_id = $1", [produtoId]);
    const itemId = carrinhoItem.rows[0].id;

    // Now, update the quantity
    const response = await request(app)
      .put(`/api/carrinho/alterar`)
      .send({
          itemId: itemId,
          novaQuantidade: 15
      });

    expect(response.status).toBe(200);

    const reserva = await db.query(
      "SELECT SUM(quantidade) as total_reservado FROM movimentacoes_consumo_contratos WHERE contrato_id = $1 AND produto_id = $2 AND tipo_movimentacao = 'RESERVA'",
      [contratoId, produtoId]
    );
    
    // Total reservation should be 15 (initial 5 is cleared and new 15 is created)
    // This depends on the implementation, let's assume it creates a new reservation for the total
    const liberacao = await db.query(
        "SELECT SUM(quantidade) as total_liberado FROM movimentacoes_consumo_contratos WHERE contrato_id = $1 AND produto_id = $2 AND tipo_movimentacao = 'LIBERACAO_RESERVA'",
        [contratoId, produtoId]
      );

    const totalReservado = reserva.rows[0].total_reservado || 0;
    const totalLiberado = liberacao.rows[0].total_liberado || 0;

    expect(totalReservado - totalLiberado).toBe(15);
  });

  it('should release stock when removing an item from the cart', async () => {
    // First, add an item
    await request(app)
      .post('/api/carrinho/adicionar')
      .send({ userId, produtoId, contratoId, quantidade: 8 });
    
    const carrinhoItem = await db.query("SELECT id FROM carrinho_itens WHERE produto_id = $1", [produtoId]);
    const itemId = carrinhoItem.rows[0].id;

    // Now, remove the item
    const response = await request(app).delete(`/api/carrinho/remover/${itemId}`);

    expect(response.status).toBe(200);

    const liberacao = await db.query(
      "SELECT * FROM movimentacoes_consumo_contratos WHERE contrato_id = $1 AND produto_id = $2 AND tipo_movimentacao = 'LIBERACAO_RESERVA'",
      [contratoId, produtoId]
    );

    expect(liberacao.rows.length).toBe(1);
    expect(liberacao.rows[0].quantidade).toBe(8);
  });

  it('should not add item if quantity exceeds available stock', async () => {
    const response = await request(app)
      .post('/api/carrinho/adicionar')
      .send({
        userId,
        produtoId,
        contratoId,
        quantidade: 200, // Exceeds the limit of 100
      });

    expect(response.status).toBe(400);
  });
});