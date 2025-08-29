import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    InputAdornment,
    useTheme,
    useMediaQuery,
    Card,
    CardContent,
    Drawer,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Search,
    FilterList,
    ViewModule,
    ViewList,
    ShoppingCart,
    Clear,
} from '@mui/icons-material';
import { carrinhoService } from '../services/carrinho';
import { ProdutoContrato } from '../types/carrinho';
import { useCarrinho } from '../context/CarrinhoContext';

const CatalogoProdutosOtimizado = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { adicionarItem, itens } = useCarrinho();

    // Estados básicos
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [viewMode, setViewMode] = useState('list');
    const [showFilters, setShowFilters] = useState(false);

    // Estados para dados
    const [products, setProducts] = useState<ProdutoContrato[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para controle do carrinho
    const [addingToCart, setAddingToCart] = useState<Set<number>>(new Set());
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Ref para controle de debounce
    const searchTimeoutRef = useRef<number>();

    // Função memoizada para carregar produtos
    const loadProducts = useCallback(async (searchQuery?: string) => {
        try {
            setLoading(true);
            setError(null);

            const filtros = {
                busca: searchQuery || undefined,
                limit: 100,
                offset: 0,
            };

            const response = await carrinhoService.getCatalogoProdutos(filtros);
            setProducts(Array.isArray(response) ? response : []);
        } catch (err: any) {
            console.error('Erro ao carregar produtos:', err);
            setError('Erro ao carregar produtos. Tente novamente.');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Carregar produtos na inicialização
    useEffect(() => {
        loadProducts();
    }, []);

    // Debounce para busca
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (searchTerm === '') {
            return;
        }

        searchTimeoutRef.current = setTimeout(() => {
            loadProducts(searchTerm);
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, loadProducts]);

    // Funções memoizadas
    const formatPrice = useCallback((price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    }, []);

    const getProductIcon = useCallback((productName: string) => {
        const name = productName.toLowerCase();
        if (name.includes('arroz')) return '🍚';
        if (name.includes('feijão')) return '🫘';
        if (name.includes('óleo')) return '🫒';
        if (name.includes('macarrão')) return '🍝';
        if (name.includes('carne')) return '🥩';
        if (name.includes('frango')) return '🍗';
        if (name.includes('leite')) return '🥛';
        if (name.includes('batata')) return '🥔';
        if (name.includes('cenoura')) return '🥕';
        if (name.includes('banana')) return '🍌';
        if (name.includes('pão')) return '🍞';
        if (name.includes('suco')) return '🧃';
        if (name.includes('açúcar')) return '🍯';
        if (name.includes('sal')) return '🧂';
        if (name.includes('farinha')) return '🌾';
        return '🍎';
    }, []);

    // Extrair fornecedores únicos
    const suppliers = useMemo(() => {
        return [...new Set(products.map(p => p.nome_fornecedor))];
    }, [products]);

    // Filtrar e ordenar produtos
    const filteredProducts = useMemo(() => {
        if (!Array.isArray(products)) return [];

        return products
            .filter(product => {
                const matchesSupplier = !selectedSupplier || product.nome_fornecedor === selectedSupplier;
                return matchesSupplier;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'price-low':
                        return a.preco_contratual - b.preco_contratual;
                    case 'price-high':
                        return b.preco_contratual - a.preco_contratual;
                    case 'name':
                        return a.nome_produto.localeCompare(b.nome_produto);
                    case 'supplier':
                        return a.nome_fornecedor.localeCompare(b.nome_fornecedor);
                    default:
                        return a.nome_produto.localeCompare(b.nome_produto);
                }
            });
    }, [products, sortBy, selectedSupplier]);

    // Funções de callback
    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setSelectedSupplier('');
        setSortBy('name');
    }, []);

    // Verificar se produto está no carrinho
    const isProductInCart = useCallback((product: ProdutoContrato) => {
        if (!Array.isArray(itens)) return false;
        return itens.some(item =>
            item.produto_id === product.produto_id &&
            item.contrato_id === product.contrato_id
        );
    }, [itens]);

    // Obter quantidade do produto no carrinho
    const getProductQuantityInCart = useCallback((product: ProdutoContrato) => {
        if (!Array.isArray(itens)) return 0;
        const item = itens.find(item =>
            item.produto_id === product.produto_id &&
            item.contrato_id === product.contrato_id
        );
        return item ? item.quantidade : 0;
    }, [itens]);

    // Função para adicionar produto ao carrinho
    const handleAddToCart = useCallback(async (product: ProdutoContrato) => {
        if (product.quantidade_disponivel <= 0) {
            setError('Produto sem estoque disponível');
            return;
        }

        if (!product.produto_id || !product.contrato_id || !product.fornecedor_id || !product.preco_contratual) {
            setError('Produto com dados incompletos. Tente recarregar a página.');
            return;
        }

        setAddingToCart(prev => new Set(prev).add(product.produto_id));

        try {
            await adicionarItem(product, 1);
            setSuccessMessage(`${product.nome_produto} adicionado ao carrinho!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error: any) {
            console.error('Erro ao adicionar produto ao carrinho:', error);
            let errorMessage = 'Erro ao adicionar produto ao carrinho';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            setError(errorMessage);
        } finally {
            setAddingToCart(prev => {
                const newSet = new Set(prev);
                newSet.delete(product.produto_id);
                return newSet;
            });
        }
    }, [adicionarItem]);

    // Componente para card do produto
    const ProductCard = ({ product }: { product: ProdutoContrato }) => {
        const isInCart = isProductInCart(product);
        const quantityInCart = getProductQuantityInCart(product);
        const isAdding = addingToCart.has(product.produto_id);

        return (
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                        transform: 'translateY(-4px)',
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #f87171, #14b8a6, #3b82f6)',
                    }}
                />

                <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box
                        sx={{
                            width: '100%',
                            height: 120,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            fontSize: '3rem',
                        }}
                    >
                        {getProductIcon(product.nome_produto)}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                fontWeight: 'bold',
                                color: '#1f2937',
                                mb: 1,
                                lineHeight: 1.3,
                                fontSize: '1rem',
                            }}
                        >
                            {product.nome_produto}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                color: '#6b7280',
                                mb: 1,
                            }}
                        >
                            <strong>Unidade:</strong> {product.unidade}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                color: '#9ca3af',
                                mb: 2,
                            }}
                        >
                            Fornecedor: {product.nome_fornecedor}
                        </Typography>

                        <Box sx={{ height: 24, display: 'flex', alignItems: 'center', mb: 2 }}>
                            {isInCart && (
                                <>
                                    <ShoppingCart sx={{ fontSize: 16, color: '#059669', mr: 1 }} />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#059669',
                                            fontWeight: 600,
                                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                        }}
                                    >
                                        {quantityInCart} no carrinho
                                    </Typography>
                                </>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 2 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 'bold',
                                    color: '#1f2937',
                                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                }}
                            >
                                {formatPrice(product.preco_contratual)}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', mt: 'auto' }}>
                            <Button
                                variant="contained"
                                startIcon={isAdding ? <CircularProgress size={16} color="inherit" /> : <ShoppingCart />}
                                disabled={product.quantidade_disponivel <= 0 || isAdding}
                                onClick={() => handleAddToCart(product)}
                                sx={{
                                    flex: 1,
                                    bgcolor: '#4f46e5',
                                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#4338ca' },
                                }}
                            >
                                {isAdding ? 'Adicionando...' : 'Carrinho'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    // Componente para item da lista
    const ProductListItem = ({ product }: { product: ProdutoContrato }) => {
        const isInCart = isProductInCart(product);
        const quantityInCart = getProductQuantityInCart(product);
        const isAdding = addingToCart.has(product.produto_id);

        return (
            <Card
                sx={{
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    }
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                flexShrink: 0,
                            }}
                        >
                            {getProductIcon(product.nome_produto)}
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                            fontWeight: 'bold',
                                            color: '#1f2937',
                                            mb: 1,
                                        }}
                                    >
                                        {product.nome_produto}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                            color: '#6b7280',
                                            mb: 0.5,
                                        }}
                                    >
                                        <strong>Unidade:</strong> {product.unidade}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                            color: '#9ca3af',
                                            mb: 1,
                                        }}
                                    >
                                        Fornecedor: {product.nome_fornecedor}
                                    </Typography>
                                    {isInCart && (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <ShoppingCart sx={{ fontSize: 16, color: '#059669', mr: 1 }} />
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#059669',
                                                    fontWeight: 600,
                                                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                                }}
                                            >
                                                {quantityInCart} no carrinho
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: '#1f2937',
                                            mb: 3,
                                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                        }}
                                    >
                                        {formatPrice(product.preco_contratual)}
                                    </Typography>
                                    <Box sx={{ display: 'flex' }}>
                                        <Button
                                            variant="contained"
                                            startIcon={isAdding ? <CircularProgress size={16} color="inherit" /> : <ShoppingCart />}
                                            disabled={product.quantidade_disponivel <= 0 || isAdding}
                                            onClick={() => handleAddToCart(product)}
                                            sx={{
                                                bgcolor: '#4f46e5',
                                                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                                textTransform: 'none',
                                                '&:hover': { bgcolor: '#4338ca' },
                                            }}
                                        >
                                            {isAdding ? 'Adicionando...' : 'Carrinho'}
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    // Componente para filtros
    const FiltersContent = () => (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        color: '#1f2937',
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    }}
                >
                    Filtros
                </Typography>
                <Button
                    startIcon={<Clear />}
                    onClick={clearFilters}
                    sx={{
                        color: '#4f46e5',
                        textTransform: 'none',
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    }}
                >
                    Limpar
                </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                    <InputLabel>Fornecedor</InputLabel>
                    <Select
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                        label="Fornecedor"
                    >
                        <MenuItem value="">Todos os fornecedores</MenuItem>
                        {suppliers.map(supplier => (
                            <MenuItem key={supplier} value={supplier}>{supplier}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
            {/* Header */}
            <Box sx={{
                bgcolor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderBottom: '1px solid #e5e7eb'
            }}>
                <Box sx={{
                    maxWidth: '1280px',
                    mx: 'auto',
                    px: { xs: 2, sm: 3, lg: 4 }
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: '64px',
                        gap: 2,
                    }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 'bold',
                                color: '#1f2937',
                                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                            }}
                        >
                            Catálogo de Produtos
                        </Typography>

                        <TextField
                            placeholder="Buscar produtos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                flex: 1,
                                maxWidth: 400,
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

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                                startIcon={<FilterList />}
                                onClick={() => setShowFilters(!showFilters)}
                                sx={{
                                    bgcolor: '#4f46e5',
                                    color: 'white',
                                    textTransform: 'none',
                                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                    '&:hover': { bgcolor: '#4338ca' },
                                }}
                            >
                                Filtros
                            </Button>
                            <Box sx={{ display: 'flex', bgcolor: '#f3f4f6', borderRadius: '8px' }}>
                                <IconButton
                                    onClick={() => setViewMode('grid')}
                                    sx={{
                                        color: viewMode === 'grid' ? '#4f46e5' : '#6b7280',
                                        bgcolor: viewMode === 'grid' ? 'white' : 'transparent',
                                        '&:hover': { bgcolor: viewMode === 'grid' ? 'white' : '#e5e7eb' },
                                    }}
                                >
                                    <ViewModule />
                                </IconButton>
                                <IconButton
                                    onClick={() => setViewMode('list')}
                                    sx={{
                                        color: viewMode === 'list' ? '#4f46e5' : '#6b7280',
                                        bgcolor: viewMode === 'list' ? 'white' : 'transparent',
                                        '&:hover': { bgcolor: viewMode === 'list' ? 'white' : '#e5e7eb' },
                                    }}
                                >
                                    <ViewList />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Mensagem de Sucesso */}
            {successMessage && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 80,
                        right: 20,
                        zIndex: 9999,
                    }}
                >
                    <Alert
                        severity="success"
                        onClose={() => setSuccessMessage(null)}
                        sx={{
                            minWidth: 300,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        }}
                    >
                        {successMessage}
                    </Alert>
                </Box>
            )}

            <Box sx={{ maxWidth: '1280px', mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
                <Box sx={{ display: 'flex', gap: 4 }}>
                    {/* Sidebar de Filtros - Desktop */}
                    {!isMobile && showFilters && (
                        <Box sx={{ width: 320, flexShrink: 0 }}>
                            <Card
                                sx={{
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    position: 'sticky',
                                    top: 32,
                                }}
                            >
                                <FiltersContent />
                            </Card>
                        </Box>
                    )}

                    {/* Drawer de Filtros - Mobile */}
                    <Drawer
                        anchor="left"
                        open={isMobile && showFilters}
                        onClose={() => setShowFilters(false)}
                    >
                        <Box sx={{ width: 300 }}>
                            <FiltersContent />
                        </Box>
                    </Drawer>

                    {/* Área Principal */}
                    <Box sx={{ flex: 1 }}>
                        {/* Barra de Ordenação */}
                        <Card
                            sx={{
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                p: 2,
                                mb: 3,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography
                                    sx={{
                                        color: '#6b7280',
                                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                    }}
                                >
                                    Mostrando {filteredProducts.length} de {products.length} produtos
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#6b7280',
                                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                        }}
                                    >
                                        Ordenar por:
                                    </Typography>
                                    <FormControl size="small" sx={{ minWidth: 150 }}>
                                        <Select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <MenuItem value="name">Nome</MenuItem>
                                            <MenuItem value="price-low">Menor preço</MenuItem>
                                            <MenuItem value="price-high">Maior preço</MenuItem>
                                            <MenuItem value="supplier">Fornecedor</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>
                        </Card>

                        {/* Loading */}
                        {loading ? (
                            <Card
                                sx={{
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    p: 6,
                                    textAlign: 'center',
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
                                    Carregando produtos...
                                </Typography>
                            </Card>
                        ) : error ? (
                            <Card
                                sx={{
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    p: 6,
                                    textAlign: 'center',
                                }}
                            >
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                                <Button
                                    variant="contained"
                                    onClick={() => loadProducts()}
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
                        ) : filteredProducts.length === 0 ? (
                            <Card
                                sx={{
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    p: 6,
                                    textAlign: 'center',
                                }}
                            >
                                <FilterList sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: '#6b7280',
                                        mb: 1,
                                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                    }}
                                >
                                    Nenhum produto encontrado
                                </Typography>
                                <Typography
                                    sx={{
                                        color: '#9ca3af',
                                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                    }}
                                >
                                    Tente ajustar os filtros ou buscar por outros termos
                                </Typography>
                            </Card>
                        ) : (
                            <Box
                                sx={{
                                    display: viewMode === 'grid' ? 'grid' : 'flex',
                                    flexDirection: viewMode === 'list' ? 'column' : undefined,
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: 'repeat(2, 1fr)',
                                        md: showFilters ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                                        lg: showFilters ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
                                    },
                                    gap: 3,
                                }}
                            >
                                {filteredProducts.map((product) => {
                                    return viewMode === 'grid' ? (
                                        <ProductCard
                                            key={`${product.produto_id}-${product.contrato_id}`}
                                            product={product}
                                        />
                                    ) : (
                                        <ProductListItem
                                            key={`${product.produto_id}-${product.contrato_id}`}
                                            product={product}
                                        />
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default CatalogoProdutosOtimizado;