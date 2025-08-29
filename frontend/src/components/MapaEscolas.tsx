import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Box, Typography, Chip, Card } from '@mui/material';
import { School, LocationOn, Person } from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { extractCoordinatesFromGoogleMapsUrl, validateCoordinates, calculateCenter, isGoogleMapsShortUrl, getGoogleMapsUrlInstructions } from '../utils/mapUtils';

// Fix para os ícones padrão do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Escola {
  id: number;
  nome: string;
  endereco?: string;
  municipio?: string;
  endereco_maps?: string;
  telefone?: string;
  nome_gestor?: string;
  administracao?: 'municipal' | 'estadual' | 'federal' | 'particular';
  ativo: boolean;
  total_alunos?: number;

}

interface MapaEscolasProps {
  escolas: Escola[];
  height?: string | number;
}

// Criar ícones customizados para escolas
const createCustomIcon = (ativo?: boolean) => {
  const color = !ativo ? '#6b7280' : '#059669';
  const displayNumber = '📍';
  
  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <!-- Marcador de localização usando CSS -->
        <div style="
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 24px;
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: translateX(-50%) rotate(-45deg);
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        "></div>
        <!-- Número dentro do marcador -->
        <div style="
          position: absolute;
          top: 3px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-weight: bold;
          font-size: 13px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          text-shadow: 0 1px 3px rgba(0,0,0,0.5);
          z-index: 10;
          line-height: 1;
          text-align: center;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${displayNumber}
        </div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [32, 42],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const MapaEscolas: React.FC<MapaEscolasProps> = ({ escolas, height = 500 }) => {
  // Processar escolas e extrair coordenadas
  const escolasComCoordenadas = useMemo(() => {
    console.log('Processando escolas para o mapa:', escolas.length);
    
    const escolasComUrl = escolas.filter(e => e.endereco_maps);
    console.log('Escolas com endereco_maps:', escolasComUrl.length);
    
    const resultado = escolas
      .map(escola => {
        if (!escola.endereco_maps) return null;
        
        const coords = extractCoordinatesFromGoogleMapsUrl(escola.endereco_maps);
        if (!coords || !validateCoordinates(coords.lat, coords.lng)) {
          console.log('Falha ao extrair coordenadas para escola:', escola.nome, escola.endereco_maps);
          return null;
        }
        
        return {
          ...escola,
          coordinates: coords
        };
      })
      .filter(Boolean) as (Escola & { coordinates: { lat: number; lng: number } })[];
    
    console.log('Escolas com coordenadas válidas:', resultado.length);
    return resultado;
  }, [escolas]);

  // Calcular centro do mapa
  const mapCenter = useMemo(() => {
    if (escolasComCoordenadas.length === 0) {
      // Centro do Brasil como fallback
      return { lat: -14.235, lng: -51.9253 };
    }
    
    return calculateCenter(escolasComCoordenadas.map(e => e.coordinates));
  }, [escolasComCoordenadas]);

  // Calcular zoom baseado na dispersão das escolas
  const mapZoom = useMemo(() => {
    if (escolasComCoordenadas.length <= 1) return 10;
    
    // Calcular a distância máxima entre pontos para determinar o zoom
    let maxDistance = 0;
    for (let i = 0; i < escolasComCoordenadas.length; i++) {
      for (let j = i + 1; j < escolasComCoordenadas.length; j++) {
        const dist = Math.sqrt(
          Math.pow(escolasComCoordenadas[i].coordinates.lat - escolasComCoordenadas[j].coordinates.lat, 2) +
          Math.pow(escolasComCoordenadas[i].coordinates.lng - escolasComCoordenadas[j].coordinates.lng, 2)
        );
        maxDistance = Math.max(maxDistance, dist);
      }
    }
    
    // Ajustar zoom baseado na distância máxima
    if (maxDistance > 5) return 6;
    if (maxDistance > 1) return 8;
    if (maxDistance > 0.5) return 10;
    return 12;
  }, [escolasComCoordenadas]);

  if (escolasComCoordenadas.length === 0) {
    const escolasComUrlsInvalidas = escolas.filter(e => e.endereco_maps && isGoogleMapsShortUrl(e.endereco_maps));
    const escolasSemUrl = escolas.filter(e => !e.endereco_maps);
    
    return (
      <Card
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 3,
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          p: 4,
        }}
      >
        <LocationOn sx={{ fontSize: 64, color: '#d1d5db' }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: '#6b7280',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            textAlign: 'center',
          }}
        >
          Nenhuma escola com localização válida encontrada
        </Typography>
        
        {escolasComUrlsInvalidas.length > 0 && (
          <Box sx={{ textAlign: 'center', maxWidth: 600 }}>
            <Typography
              sx={{
                color: '#d97706',
                fontWeight: 600,
                mb: 1,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              ⚠️ {escolasComUrlsInvalidas.length} escola(s) com URLs encurtadas detectadas
            </Typography>
            <Typography
              sx={{
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              URLs como "maps.app.goo.gl" não contêm coordenadas. Use URLs completas do Google Maps.
            </Typography>
          </Box>
        )}
        
        {escolasSemUrl.length > 0 && (
          <Typography
            sx={{
              color: '#9ca3af',
              textAlign: 'center',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {escolasSemUrl.length} escola(s) sem URL do Google Maps cadastrada
          </Typography>
        )}
        
        <Box sx={{ textAlign: 'left', maxWidth: 500, bgcolor: '#f8fafc', p: 3, borderRadius: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: '#374151',
              mb: 2,
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            Como obter uma URL válida do Google Maps:
          </Typography>
          {getGoogleMapsUrlInstructions().map((instruction, index) => (
            <Typography
              key={index}
              sx={{
                color: instruction.startsWith('•') ? '#059669' : '#6b7280',
                fontSize: '0.875rem',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontWeight: instruction.startsWith('•') ? 600 : 400,
                mb: instruction === '' ? 1 : 0.5,
              }}
            >
              {instruction}
            </Typography>
          ))}
        </Box>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        height,
      }}
    >
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {escolasComCoordenadas.map((escola) => (
          <Marker
            key={escola.id}
            position={[escola.coordinates.lat, escola.coordinates.lng]}
            icon={createCustomIcon(escola.ativo)}
          >
            <Popup maxWidth={300}>
              <Box sx={{ p: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#1f2937',
                    mb: 1,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  {escola.nome}
                </Typography>
                
                {escola.endereco && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: '#6b7280' }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6b7280',
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      }}
                    >
                      {escola.endereco}
                    </Typography>
                  </Box>
                )}
                
                {escola.municipio && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#6b7280',
                      mb: 1,
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    }}
                  >
                    {escola.municipio}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <School sx={{ fontSize: 16, color: '#2563eb' }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#374151',
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    }}
                  >
                    {escola.total_alunos || 0} alunos
                  </Typography>
                </Box>
                
                {escola.nome_gestor && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Person sx={{ fontSize: 16, color: '#6b7280' }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6b7280',
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      }}
                    >
                      {escola.nome_gestor}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                  <Chip
                    label={escola.ativo ? 'Ativa' : 'Inativa'}
                    size="small"
                    sx={{
                      bgcolor: escola.ativo ? '#dcfce7' : '#fef2f2',
                      color: escola.ativo ? '#166534' : '#dc2626',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    }}
                  />
                </Box>
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Card>
  );
};

export default MapaEscolas;