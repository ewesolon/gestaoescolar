import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';

interface TestInputDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function TestInputDialog({ open, onClose }: TestInputDialogProps) {
  const [quantidade, setQuantidade] = useState('');
  const [valor, setValor] = useState('');
  const [useValor, setUseValor] = useState(false);

  const handleQuantidadeChange = (value: string) => {
    console.log('Quantidade mudou para:', value);
    setQuantidade(value);
    
    // Auto-calcular valor se não estiver sendo editado manualmente
    if (!useValor) {
      const qtd = parseFloat(value) || 0;
      const valorCalculado = qtd * 5.0; // Preço fixo para teste
      const novoValor = valorCalculado > 0 ? valorCalculado.toFixed(2) : '';
      console.log('Valor calculado:', novoValor);
      setValor(novoValor);
    }
  };

  const handleValorChange = (value: string) => {
    console.log('Valor mudou para:', value);
    if (value !== '') {
      setUseValor(true);
    }
    setValor(value);
  };

  const handleClose = () => {
    setQuantidade('');
    setValor('');
    setUseValor(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Teste de Input - Debug
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            type="number"
            label="Quantidade"
            value={quantidade}
            onChange={(e) => handleQuantidadeChange(e.target.value)}
            helperText="Digite uma quantidade"
          />
          
          <TextField
            fullWidth
            type="number"
            label="Valor"
            value={valor}
            onChange={(e) => handleValorChange(e.target.value)}
            helperText="Calculado automaticamente ou digite manualmente"
          />
          
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Debug Info:</strong>
            </Typography>
            <Typography variant="body2">
              useValor: {useValor ? 'true' : 'false'}
            </Typography>
            <Typography variant="body2">
              quantidade: "{quantidade}"
            </Typography>
            <Typography variant="body2">
              valor: "{valor}"
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}