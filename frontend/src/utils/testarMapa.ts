// Utilitário para testar a funcionalidade do mapa
import { extractCoordinatesFromGoogleMapsUrl } from './mapUtils';

export function testarExtracaoCoordenadasConsole() {
  console.log('🧪 TESTE DE EXTRAÇÃO DE COORDENADAS');
  console.log('=====================================');
  
  const urlsTeste = [
    'https://maps.google.com/@-1.3635108,-48.2513482,15z', // Belém
    'https://maps.google.com/@-23.5505,-46.6333,15z', // São Paulo
    'https://maps.google.com/@-22.9068,-43.1729,15z', // Rio de Janeiro
    'https://maps.google.com/@-15.7942,-47.8822,15z', // Brasília
    'https://maps.google.com/@-12.9714,-38.5014,15z', // Salvador
    'https://maps.app.goo.gl/invalid', // URL inválida
  ];
  
  urlsTeste.forEach((url, index) => {
    console.log(`\n${index + 1}. Testando: ${url}`);
    const coords = extractCoordinatesFromGoogleMapsUrl(url);
    
    if (coords) {
      console.log(`   ✅ Coordenadas extraídas: ${coords.lat}, ${coords.lng}`);
    } else {
      console.log(`   ❌ Falha na extração`);
    }
  });
  
  console.log('\n🎯 Teste concluído!');
}

// Função para ser chamada no console do navegador
(window as any).testarMapa = testarExtracaoCoordenadasConsole;