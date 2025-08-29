// Arquivo de teste para demonstrar URLs válidas do Google Maps
// Este arquivo pode ser removido após os testes

export const exemploUrlsValidas = [
  // São Paulo - Formato @
  'https://maps.google.com/@-23.5505,-46.6333,15z',
  
  // Rio de Janeiro - Formato ll=
  'https://maps.google.com/maps?ll=-22.9068,-43.1729',
  
  // Brasília - Formato place com @
  'https://maps.google.com/maps/place/Brasília,+DF/@-15.7942,-47.8822,11z',
  
  // Belo Horizonte - Formato !3d/!4d
  'https://www.google.com/maps/@-19.9167,-43.9345,12z/data=!3m1!4b1!4m6!3m5!1s0xa690cacacf2c33:0x5b35795e3ad23997!8m2!3d-19.9166813!4d-43.9344931!16zL20vMDFfOTI',
  
  // Salvador - Formato q=
  'https://maps.google.com/maps?q=-12.9714,-38.5014'
];

export const exemploUrlsInvalidas = [
  // URLs encurtadas (não funcionam)
  'https://maps.app.goo.gl/Mwivg1xBLD6YFWya6',
  'https://goo.gl/maps/abc123',
  
  // URLs sem coordenadas
  'https://maps.google.com/',
  'https://maps.google.com/maps/search/escola',
  
  // URLs malformadas
  'maps.google.com',
  'www.google.com'
];

// Função para testar a extração de coordenadas
export function testarExtracao() {
  console.log('=== TESTE DE EXTRAÇÃO DE COORDENADAS ===');
  
  console.log('\n--- URLs VÁLIDAS ---');
  exemploUrlsValidas.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
    // A função de extração seria chamada aqui
  });
  
  console.log('\n--- URLs INVÁLIDAS ---');
  exemploUrlsInvalidas.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
    // A função de extração seria chamada aqui
  });
}