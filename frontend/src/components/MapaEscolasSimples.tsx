import React, { useMemo, useEffect, useRef } from 'react';
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

interface MapaEscolasSimplesProps {
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

const MapaEscolasSimples: React.FC<MapaEscolasSimplesProps> = ({ escolas, height = 500 }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

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

  // Calcular zoom baseado na dispersão das escolas (usado como fallback)
  const mapZoom = useMemo(() => {
    if (escolasComCoordenadas.length === 0) return 4; // Zoom do Brasil
    if (escolasComCoordenadas.length === 1) return 13; // Zoom para uma escola
    
    // Para múltiplas escolas, o zoom será calculado automaticamente pelo fitBounds
    // Este valor é usado apenas como fallback
    return 8;
  }, [escolasComCoordenadas]);

  // Inicializar o mapa usando Leaflet diretamente
  useEffect(() => {
    if (!mapRef.current) return;

    // Limpar mapa anterior se existir
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Se não há escolas, criar mapa vazio
    if (escolasComCoordenadas.length === 0) {
      const map = L.map(mapRef.current).setView([-14.235, -51.9253], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      mapInstanceRef.current = map;
      return;
    }

    // Criar novo mapa
    const map = L.map(mapRef.current).setView([mapCenter.lat, mapCenter.lng], mapZoom);

    // Adicionar tiles do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Criar grupo de marcadores para ajuste automático de bounds
    const markersGroup = L.featureGroup();

    // Adicionar marcadores
    escolasComCoordenadas.forEach((escola) => {
      const marker = L.marker([escola.coordinates.lat, escola.coordinates.lng], {
        icon: createCustomIcon(escola.ativo)
      });

      // Criar conteúdo do popup
      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; min-width: 250px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
            ${escola.nome}
          </h3>
          
          ${escola.endereco ? `
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <span style="color: #6b7280; font-size: 14px;">📍 ${escola.endereco}</span>
            </div>
          ` : ''}
          
          ${escola.municipio ? `
            <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">
              ${escola.municipio}
            </div>
          ` : ''}
          
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
            <span style="color: #2563eb; font-size: 14px;">🏫 ${escola.total_alunos || 0} alunos</span>
          </div>
          
          ${escola.nome_gestor ? `
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
              <span style="color: #6b7280; font-size: 14px;">👤 ${escola.nome_gestor}</span>
            </div>
          ` : ''}
          
          <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 8px;">

            
            <span style="
              background-color: ${escola.ativo ? '#dcfce7' : '#fef2f2'};
              color: ${escola.ativo ? '#166534' : '#dc2626'};
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
            ">${escola.ativo ? 'Ativa' : 'Inativa'}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300 });
      markersGroup.addLayer(marker);
    });

    // Adicionar grupo de marcadores ao mapa
    markersGroup.addTo(map);

    // Ajustar o mapa para mostrar todos os marcadores
    setTimeout(() => {
      try {
        if (escolasComCoordenadas.length === 1) {
          // Se há apenas uma escola, centralizar nela com zoom adequado
          const escola = escolasComCoordenadas[0];
          map.setView([escola.coordinates.lat, escola.coordinates.lng], 13);
        } else if (escolasComCoordenadas.length > 1) {
          // Se há múltiplas escolas, ajustar para mostrar todas
          const bounds = markersGroup.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, {
              padding: [20, 20], // Adicionar padding para não cortar os marcadores
              maxZoom: 15 // Limitar zoom máximo para não ficar muito próximo
            });
          }
        }
      } catch (error) {
        console.warn('Erro ao ajustar bounds do mapa:', error);
        // Fallback: usar centro e zoom calculados
        map.setView([mapCenter.lat, mapCenter.lng], mapZoom);
      }
    }, 100); // Pequeno delay para garantir que o DOM está pronto

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
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
      <div
        ref={mapRef}
        style={{
          height: '100%',
          width: '100%',
        }}
      />
    </Card>
  );
};

export default MapaEscolasSimples;