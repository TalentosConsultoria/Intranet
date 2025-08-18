# Talentos Wiki — Versão Completa com Seção POP

Esta é a versão completa da Talentos Wiki, incluindo a nova seção **Procedimentos Operacionais Padrão (POP)**. A aplicação é **puramente estática** e mantém os dados apenas **em memória** enquanto a página está aberta.

## 🆕 Nova Seção: Procedimentos Operacionais Padrão (POP)

### Características da Seção POP:
- **Organização por Setores**: Recursos Humanos, Tecnologia da Informação, Financeiro
- **Sistema de Filtros**: Navegação por setor ou visualização completa
- **Busca Específica**: Campo de pesquisa para localizar POPs por código ou nome
- **Download de Modelo**: Botão para baixar template base de POP
- **Ações por Documento**: Visualizar e baixar cada procedimento
- **Design Responsivo**: Totalmente adaptado para mobile

### Setores Implementados:
1. **📁 Recursos Humanos (RH)**
   - POP-RH-001: Procedimento de Admissão de Colaboradores
   - POP-RH-002: Processo de Avaliação de Desempenho
   - POP-RH-003: Gestão de Férias e Licenças

2. **💻 Tecnologia da Informação (TI)**
   - POP-TI-001: Backup e Recuperação de Dados
   - POP-TI-002: Configuração de Novas Estações de Trabalho
   - POP-TI-003: Gerenciamento de Incidentes de Segurança

3. **💰 Financeiro**
   - POP-FIN-001: Processo de Contas a Pagar
   - POP-FIN-002: Conciliação Bancária
   - POP-FIN-003: Elaboração de Relatórios Financeiros

## 📁 Estrutura de Arquivos

```
talentos-wiki/
├── index.html          # Página principal com todas as seções
├── styles.css          # Estilos CSS incluindo nova seção POP
├── script.js           # JavaScript com funcionalidades POP
└── README.md           # Este arquivo de documentação
```

## 🚀 Como Usar

1. **Instalação**: 
   - Baixe todos os arquivos para uma pasta
   - Abra `index.html` em um navegador moderno

2. **Navegação**:
   - Use o menu superior para acessar "POPs"
   - Ou clique no quick-link "POPs" na página inicial

3. **Funcionalidades POP**:
   - **Filtrar por Setor**: Use os botões de filtro para ver apenas um setor
   - **Buscar POP**: Digite código ou nome no campo de pesquisa
   - **Download Modelo**: Clique em "📥 Baixar Modelo de POP"
   - **Visualizar/Baixar**: Use os botões "👁️ Ver" e "⬇️ Baixar" em cada POP

## 🛠️ Personalização

### Adicionar Novos POPs:
No arquivo `script.js`, adicione novos itens ao array `wikiData.pops`:

```javascript
{ 
  codigo: "POP-XX-000", 
  nome: "Nome do Procedimento", 
  setor: "setor", 
  dataAtualizacao: "DD/MM/AAAA" 
}
```

### Adicionar Novos Setores:
1. **HTML**: Adicione nova seção em `index.html` seguindo o padrão existente
2. **CSS**: Os estilos já são genéricos e funcionarão automaticamente
3. **JavaScript**: Adicione botão de filtro correspondente

### Estrutura de Pastas Recomendada (para versão com backend):
```
docs/
├── pop/
│   ├── modelo-pop.docx
│   ├── rh/
│   │   ├── POP-RH-001.pdf
│   │   ├── POP-RH-002.pdf
│   │   └── POP-RH-003.pdf
│   