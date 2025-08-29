# Boas Práticas para Typography no Material UI

## 🚨 Problema Comum

O erro `children` no Typography ocorre quando valores `undefined`, `null` ou não-string são passados para o componente.

## ✅ Soluções Recomendadas

### 1. Hook useSafeData (Recomendado)

```tsx
import { useSafeData } from "../hooks/useSafeData";

function MeuComponente() {
  const { safeString, safeNumber, safeDate } = useSafeData();

  return (
    <Typography variant="h3">{safeString(valor, "Valor padrão")}</Typography>
  );
}
```

### 2. Componente SafeTypography

```tsx
import SafeTypography from "../components/SafeTypography";

function MeuComponente() {
  return (
    <SafeTypography variant="h3" fallback="Valor padrão">
      {valor}
    </SafeTypography>
  );
}
```

### 3. Validação Inline (Para casos simples)

```tsx
<Typography variant="h3">
  {valor ?? "Valor padrão"}
</Typography>

// Ou
<Typography variant="h3">
  {String(valor || "Valor padrão")}
</Typography>
```

## 🛡️ Validação de Funções

### Antes (Problemático)

```tsx
function calcularProgresso(dataInicio: string, dataFim: string) {
  const hoje = new Date();
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const total = fim.getTime() - inicio.getTime();
  const atual = hoje.getTime() - inicio.getTime();
  return Math.min(Math.max((atual / total) * 100, 0), 100);
}
```

### Depois (Seguro)

```tsx
function calcularProgresso(dataInicio: string, dataFim: string): number {
  if (!dataInicio || !dataFim) return 0;
  try {
    const hoje = new Date();
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const total = fim.getTime() - inicio.getTime();
    const atual = hoje.getTime() - inicio.getTime();
    const progresso = Math.min(Math.max((atual / total) * 100, 0), 100);
    return isNaN(progresso) ? 0 : progresso;
  } catch {
    return 0;
  }
}
```

## 📋 Checklist de Validação

- [ ] Valores `undefined` ou `null` têm fallback
- [ ] Funções de cálculo retornam valores válidos
- [ ] Datas são validadas antes de formatação
- [ ] Números são verificados com `isNaN()`
- [ ] Strings vazias têm valor padrão
- [ ] Try/catch em operações que podem falhar

## 🎯 Padrões Recomendados

### Para Dados Dinâmicos

```tsx
const { safeString, safeNumber, safeDate } = useSafeData();

<Typography variant="h3">{safeString(dados.valor, "0")}</Typography>;
```

### Para Dados Estáticos

```tsx
<Typography variant="h3">{valor ?? "Valor padrão"}</Typography>
```

### Para Cálculos Complexos

```tsx
<Typography variant="h3">
  {safeString(calcularValor().toFixed(2), "0.00")}
</Typography>
```

## ⚡ Performance

- Use `useMemo` para funções de validação complexas
- Evite validações desnecessárias em renderizações
- Prefira validação no momento da renderização
- Use fallbacks simples para melhor performance

## 🔧 Debugging

Para identificar problemas:

```tsx
console.log("Valor:", valor, "Tipo:", typeof valor);
<Typography variant="h3">
  {safeString(valor, "ERRO: Valor inválido")}
</Typography>;
```
