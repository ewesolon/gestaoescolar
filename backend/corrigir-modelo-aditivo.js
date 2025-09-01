const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/models/AditivoContrato.ts');

// Ler o arquivo
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Corrigindo referências no modelo AditivoContrato...');

// Substituições necessárias
const replacements = [
  // Corrigir referências à coluna limite para quantidade_contratada
  {
    from: /cp\.limite as quantidade_atual/g,
    to: 'cp.quantidade_contratada as quantidade_atual'
  },
  {
    from: /cp\.limite as quantidade_original/g,
    to: 'cp.quantidade_contratada as quantidade_original'
  },
  {
    from: /cp\.preco/g,
    to: 'cp.preco_unitario as preco'
  },
  {
    from: /SELECT limite FROM contrato_produtos/g,
    to: 'SELECT quantidade_contratada FROM contrato_produtos'
  },
  {
    from: /\.limite\)/g,
    to: '.quantidade_contratada)'
  },
  {
    from: /\(cp\.limite \* cp\.preco\)/g,
    to: '(cp.quantidade_contratada * cp.preco_unitario)'
  },
  // Corrigir UPDATEs para não usar saldo (que não existe)
  {
    from: /SET limite = \$1, saldo = saldo \+ \$2\s+WHERE id = \$3/g,
    to: 'SET quantidade_contratada = $1\n          WHERE id = $2'
  },
  {
    from: /SET limite = \$1, saldo = saldo - \$2\s+WHERE id = \$3/g,
    to: 'SET quantidade_contratada = $1\n          WHERE id = $2'
  },
  {
    from: /SET limite = limite - \$1, saldo = saldo - \$2\s+WHERE id = \$3/g,
    to: 'SET quantidade_contratada = quantidade_contratada - $1\n          WHERE id = $2'
  }
];

// Aplicar substituições
replacements.forEach((replacement, index) => {
  const before = content;
  content = content.replace(replacement.from, replacement.to);
  if (before !== content) {
    console.log(`✅ Substituição ${index + 1} aplicada`);
  } else {
    console.log(`⚠️ Substituição ${index + 1} não encontrou correspondências`);
  }
});

// Corrigir parâmetros dos queries que mudaram
content = content.replace(
  /\[item\.quantidade_nova, item\.quantidade_adicional, item\.contrato_produto_id\]/g,
  '[item.quantidade_nova, item.contrato_produto_id]'
);

content = content.replace(
  /\[quantidadeOriginal, quantidadeAdicional, item\.contrato_produto_id\]/g,
  '[quantidadeOriginal, item.contrato_produto_id]'
);

// Salvar o arquivo corrigido
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Modelo AditivoContrato corrigido com sucesso!');