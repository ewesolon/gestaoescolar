/**
 * Extrai coordenadas de uma URL do Google Maps
 * Suporta vários formatos de URL do Google Maps
 */
export function extractCoordinatesFromGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  if (!url || typeof url !== 'string') return null;

  try {
    // Limpar a URL e decodificar se necessário
    const cleanUrl = decodeURIComponent(url.trim());
    
    // Verificar se é uma URL encurtada do Google Maps
    if (cleanUrl.includes('maps.app.goo.gl') || cleanUrl.includes('goo.gl/maps')) {
      console.warn('URL encurtada detectada:', cleanUrl);
      console.warn('Para extrair coordenadas, use a URL completa do Google Maps.');
      console.warn('Abra o link no navegador e copie a URL completa da barra de endereços.');
      return null;
    }
    
    // Formato 1: @lat,lng,zoom (mais comum)
    const atMatch = cleanUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      if (validateCoordinates(lat, lng)) {
        return { lat, lng };
      }
    }

    // Formato 2: ll=lat,lng
    const llMatch = cleanUrl.match(/ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (llMatch) {
      const lat = parseFloat(llMatch[1]);
      const lng = parseFloat(llMatch[2]);
      if (validateCoordinates(lat, lng)) {
        return { lat, lng };
      }
    }

    // Formato 3: q=lat,lng (apenas números)
    const qMatch = cleanUrl.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (qMatch) {
      const lat = parseFloat(qMatch[1]);
      const lng = parseFloat(qMatch[2]);
      if (validateCoordinates(lat, lng)) {
        return { lat, lng };
      }
    }

    // Formato 4: !3d e !4d (formato mais complexo)
    const d3Match = cleanUrl.match(/!3d(-?\d+\.?\d*)/);
    const d4Match = cleanUrl.match(/!4d(-?\d+\.?\d*)/);
    if (d3Match && d4Match) {
      const lat = parseFloat(d3Match[1]);
      const lng = parseFloat(d4Match[1]);
      if (validateCoordinates(lat, lng)) {
        return { lat, lng };
      }
    }

    // Formato 5: /maps/place/ com coordenadas
    const placeMatch = cleanUrl.match(/\/maps\/place\/[^/]*\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (placeMatch) {
      const lat = parseFloat(placeMatch[1]);
      const lng = parseFloat(placeMatch[2]);
      if (validateCoordinates(lat, lng)) {
        return { lat, lng };
      }
    }

    // Formato 6: Coordenadas com mais precisão (6+ dígitos decimais)
    const preciseMatch = cleanUrl.match(/(-?\d{1,3}\.\d{6,}),(-?\d{1,3}\.\d{6,})/);
    if (preciseMatch) {
      const lat = parseFloat(preciseMatch[1]);
      const lng = parseFloat(preciseMatch[2]);
      if (validateCoordinates(lat, lng)) {
        return { lat, lng };
      }
    }

    // Formato 7: Coordenadas separadas por vírgula simples (fallback)
    const simpleMatch = cleanUrl.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (simpleMatch) {
      const lat = parseFloat(simpleMatch[1]);
      const lng = parseFloat(simpleMatch[2]);
      if (validateCoordinates(lat, lng)) {
        return { lat, lng };
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao extrair coordenadas da URL:', error, url);
    return null;
  }
}

/**
 * Valida se as coordenadas estão dentro de limites razoáveis
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Calcula o centro geográfico de um conjunto de coordenadas
 */
export function calculateCenter(coordinates: { lat: number; lng: number }[]): { lat: number; lng: number } {
  if (coordinates.length === 0) {
    // Centro do Brasil como fallback
    return { lat: -14.235, lng: -51.9253 };
  }

  const sum = coordinates.reduce(
    (acc, coord) => ({
      lat: acc.lat + coord.lat,
      lng: acc.lng + coord.lng
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / coordinates.length,
    lng: sum.lng / coordinates.length
  };
}

/**
 * Verifica se uma URL é um link encurtado do Google Maps
 */
export function isGoogleMapsShortUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps');
}

/**
 * Gera instruções para obter uma URL válida do Google Maps
 */
export function getGoogleMapsUrlInstructions(): string[] {
  return [
    '1. Abra o Google Maps no navegador',
    '2. Pesquise pelo local desejado',
    '3. Clique no local no mapa',
    '4. Copie a URL completa da barra de endereços',
    '5. A URL deve conter coordenadas como: @-23.5505,-46.6333',
    '',
    'Formatos aceitos:',
    '• https://maps.google.com/@-23.5505,-46.6333,15z',
    '• https://maps.google.com/maps?ll=-23.5505,-46.6333',
    '• https://maps.google.com/maps/place/Local/@-23.5505,-46.6333',
    '',
    'Evite usar links encurtados (goo.gl) pois não contêm coordenadas.'
  ];
}

/**
 * Gera uma URL de exemplo válida do Google Maps para uma cidade brasileira
 */
export function generateExampleGoogleMapsUrl(city: string = 'São Paulo'): string {
  const coordinates = {
    'São Paulo': '@-23.5505,-46.6333,15z',
    'Rio de Janeiro': '@-22.9068,-43.1729,15z',
    'Brasília': '@-15.7942,-47.8822,15z',
    'Salvador': '@-12.9714,-38.5014,15z',
    'Fortaleza': '@-3.7319,-38.5267,15z',
    'Belo Horizonte': '@-19.9167,-43.9345,15z',
    'Manaus': '@-3.1190,-60.0217,15z',
    'Curitiba': '@-25.4284,-49.2733,15z',
    'Recife': '@-8.0476,-34.8770,15z',
    'Porto Alegre': '@-30.0346,-51.2177,15z'
  };
  
  const coord = coordinates[city as keyof typeof coordinates] || coordinates['São Paulo'];
  return `https://maps.google.com/${coord}`;
}