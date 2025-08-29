import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Chip,
  Card,
  CircularProgress,
  Alert,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  Map,
  Clear,
  LocationOn,
  School,
} from '@mui/icons-material';
import { listarEscolas } from '../services/escolas';
// import MapaEscolasRobusta from '../components/MapaEscolasRobusta';
import '../utils/testarMapa';

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

const MapaEscolasPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Estados principais
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Carregar escolas
  const loadEscolas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarEscolas();
      setEscolas(data);
    } catch (err: any) {
      console.error('Erro ao carregar escolas:', err);
      setError('Erro ao carregar escolas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEscolas();
  }, []);

  // Extrair dados únicos para filtros
  const municipios = [...new Set(escolas.map(e => e.municipio).filter(Boolean))];

  // Filtrar escolas
  const filteredEscolas = useMemo(() => {
    return escolas.filter(escola => {
      const matchesSearch = escola.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        escola.endereco?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        escola.municipio?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMunicipio = !selectedMunicipio || escola.municipio === selectedMunicipio;
      const matchesStatus = !selectedStatus ||
        (selectedStatus === 'ativo' && escola.ativo) ||
        (selectedStatus === 'inativo' && !escola.ativo);

      return matchesSearch && matchesMunicipio && matchesStatus;
    });
  }, [escolas, searchTerm, selectedMunicipio, selectedStatus]);

  // Estatísticas das escolas filtradas
  const stats = useMemo(() => {
    const escolasComLocalizacao = filteredEscolas.filter(e => e.endereco_maps);
    const totalAlunos = filteredEscolas.reduce((sum, e) => sum + (e.total_alunos || 0), 0);
    const escolasAtivas = filteredEscolas.filter(e => e.ativo).length;
    
    return {
      total: filteredEscolas.length,
      comLocalizacao: escolasComLocalizacao.length,
      semLocalizacao: filteredEscolas.length - escolasComLocalizacao.length,
      totalAlunos,
      ativas: escolasAtivas,
      inativas: filteredEscolas.length - escolasAtivas,
    };
  }, [filteredEscolas]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMunicipio('');
    setSelectedStatus('');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
        
        {/* Cabeçalho */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Map sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1f2937',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
              >
                Mapa das Escolas
              </Typography>
              <Typography
                sx={{
                  color: '#6b7280',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
              >
                Visualização geográfica das escolas cadastradas
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Controles e Filtros */}
        <Card
          sx={{
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            p: 3,
            mb: 3,
          }}
        >
          {/* Primeira linha: Busca e botões */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <TextField
              placeholder="Buscar escolas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#9ca3af' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              startIcon={<Clear />}
              onClick={clearFilters}
              sx={{
                color: '#4f46e5',
                textTransform: 'none',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Limpar Filtros
            </Button>
          </Box>

          {/* Segunda linha: Filtros */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center', mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Município</InputLabel>
              <Select
                value={selectedMunicipio}
                onChange={(e) => setSelectedMunicipio(e.target.value)}
                label="Município"
              >
                <MenuItem value="">Todos os municípios</MenuItem>
                {municipios.map(municipio => (
                  <MenuItem key={municipio} value={municipio}>{municipio}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="ativo">Ativas</MenuItem>
                <MenuItem value="inativo">Inativas</MenuItem>
              </Select>
            </FormControl>


          </Box>

          {/* Estatísticas */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<School />}
              label={`${stats.total} escolas`}
              sx={{
                bgcolor: '#f0f9ff',
                color: '#0369a1',
                fontWeight: 600,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            />
            <Chip
              icon={<LocationOn />}
              label={`${stats.comLocalizacao} com localização`}
              sx={{
                bgcolor: '#dcfce7',
                color: '#166534',
                fontWeight: 600,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            />
            {stats.semLocalizacao > 0 && (
              <Chip
                label={`${stats.semLocalizacao} sem localização`}
                sx={{
                  bgcolor: '#fef3c7',
                  color: '#d97706',
                  fontWeight: 600,
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
              />
            )}
            <Chip
              label={`${stats.totalAlunos.toLocaleString()} alunos`}
              sx={{
                bgcolor: '#f3e8ff',
                color: '#7c3aed',
                fontWeight: 600,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            />
          </Box>
        </Card>

        {/* Mapa */}
        {loading ? (
          <Card
            sx={{
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              p: 6,
              textAlign: 'center',
              height: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#6b7280',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Carregando mapa das escolas...
            </Typography>
          </Card>
        ) : error ? (
          <Card
            sx={{
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              p: 6,
              textAlign: 'center',
              height: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={loadEscolas}
              sx={{
                bgcolor: '#4f46e5',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                textTransform: 'none',
                '&:hover': { bgcolor: '#4338ca' },
              }}
            >
              Tentar Novamente
            </Button>
          </Card>
        ) : (
          <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            Mapa em desenvolvimento
          </Typography>
        )}

        {/* Legenda */}
        <Card
          sx={{
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            p: 3,
            mt: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#1f2937',
              mb: 2,
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            Legenda
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: '#4285F4', // Azul Google Maps
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              />
              <Typography
                sx={{
                  color: '#374151',
                  fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
              >
                Escola ativa
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: '#9E9E9E', // Cinza Google Maps
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              />
              <Typography
                sx={{
                  color: '#374151',
                  fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
              >
                Escola inativa
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default MapaEscolasPage;