---
name: 🎯 Limpeza Específica por Site
about: Acompanhar desenvolvimento de limpeza direcionada de dados de sites
title: '[FUNCIONALIDADE] Implementação de Limpeza Específica por Site'
labels: ['enhancement', 'feature', 'funding-goal']
assignees: ['TenSoja']
---

## 🎯 Visão Geral da Funcionalidade
Implementar limpeza específica de dados por site para permitir que usuários limpem cache, cookies e armazenamento apenas de sites específicos.

## 💰 Meta de Financiamento
**Meta:** $30 no Buy Me a Coffee  
**Progresso Atual:** ![Funding](https://img.shields.io/badge/funding-$0%2F$30-red?style=for-the-badge&logo=buymeacoffee)

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/tensoja)

> 📅 **Como acompanhar:** O progresso será atualizado manualmente nesta issue conforme recebemos doações. Comentários serão adicionados a cada marco atingido!

## 📋 Tarefas de Implementação

### Fase 1: Infraestrutura Central
- [ ] Adicionar interface de gerenciamento de sites na página de opções
- [ ] Implementar validação e análise de domínios
- [ ] Criar sistema de armazenamento de sites (favoritos/recentes)
- [ ] Adicionar novas permissões se necessário (`tabs`, `activeTab`)

### Fase 2: Limpeza Específica por Site
- [ ] Implementar filtragem baseada em domínio para `browsingData.remove()`
- [ ] Adicionar limpeza de dados específica por origem
- [ ] Suporte para domínios curinga (*.example.com)
- [ ] Tipos de dados seletivos por site

### Fase 3: UX Aprimorada
- [ ] Seletor rápido de sites no popup/menu de contexto
- [ ] Auto-sugestão de sites visitados recentemente
- [ ] Gerenciamento de sites favoritos
- [ ] Histórico de limpeza específica por site

### Fase 4: Funcionalidades Avançadas
- [ ] Operações em massa de sites
- [ ] Agrupamento de sites (ambientes dev, prod, test)
- [ ] Exportar/importar listas de sites
- [ ] Estatísticas por site

## 🎨 Ideias de Mockup da Interface

### Adição à Página de Opções:
```
┌─────────────────────────────────────┐
│ Limpeza Específica por Site         │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Adicionar Site: [example.com  ] │ │
│ │                [+ Adicionar]    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Sites Favoritos:                    │
│ • github.com        [Limpar] [Edit] │
│ • localhost:3000    [Limpar] [Edit] │
│ • stackoverflow.com [Limpar] [Edit] │
│                                     │
│ ☑ Mostrar sites recentes automaticamente │
│ ☑ Habilitar domínios curinga        │
└─────────────────────────────────────┘
```

### Adição ao Menu de Contexto:
```
Limpar Cache
├─ Limpar cache e recarregar página
├─ ────────────────────────────
├─ Limpar apenas este site
└─ Opções específicas por site...
```

## 🔧 Implementação Técnica

### Novos Arquivos:
- `js/site-manager.js` - Lógica de gerenciamento de sites
- `js/domain-utils.js` - Utilitários de análise de domínios
- `css/site-options.css` - Estilização da interface específica por site

### Arquivos Modificados:
- `background.js` - Adicionar funções de limpeza específica por site
- `options/options.html` - Adicionar interface de gerenciamento de sites
- `options/options.js` - Interações de gerenciamento de sites
- `manifest.json` - Adicionar permissões necessárias
- `_locales/*/messages.json` - Adicionar novas strings de i18n

### Uso da API:
```javascript
// Limpar dados para origem específica
browser.browsingData.remove({
  origins: ["https://example.com"]
}, {
  cache: true,
  cookies: true,
  localStorage: true
});
```

## 🧪 Lista de Verificação de Testes
- [ ] Validação de domínio funciona corretamente
- [ ] Domínios curinga funcionam adequadamente
- [ ] Limpeza de dados é verdadeiramente específica por site
- [ ] Interface é intuitiva e responsiva
- [ ] i18n funciona para todos os idiomas suportados
- [ ] Sem perda de dados para sites não direcionados
- [ ] Impacto na performance é mínimo

## 📖 Atualizações de Documentação
- [ ] Atualizar README com nova funcionalidade
- [ ] Adicionar capturas de tela à página de opções
- [ ] Atualizar explicação de permissões
- [ ] Adicionar seção de solução de problemas

## 🎯 Critérios de Aceitação
- [ ] Usuários podem adicionar/remover sites favoritos
- [ ] Limpeza específica por site funciona para cache, cookies, localStorage
- [ ] Interface está integrada perfeitamente com opções existentes
- [ ] Funcionalidade está totalmente internacionalizada
- [ ] Zero impacto na funcionalidade existente
- [ ] Performance permanece otimizada

---

**Nota:** Esta funcionalidade será implementada assim que a meta de financiamento de $30 for atingida no Buy Me a Coffee. Obrigado pelo seu apoio! 🙏
