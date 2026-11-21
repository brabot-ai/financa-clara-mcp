# Finança Clara — Etapa 1 (demonstração educacional)

Aplicação de chat do Bootcamp Bradesco/DIO baseada no guia “MCP sem complicação”. **DEMONSTRAÇÃO · DADOS FICTÍCIOS.**

- **Não acessa APIs bancárias** (Plaid, Pluggy ou outras): nenhuma instituição está conectada.
- **Não usa IA generativa** (OpenAI, Claude etc.) para interpretar dados: as respostas vêm de um motor de regras local e determinístico.
- Sem banco de dados, sem segredos, sem localStorage/sessionStorage; o histórico fica só em memória durante a visita.
- Somente leitura: não realiza Pix, pagamentos, transferências nem contratações.
- Valores em USD (formato `US$ 110,00`), sem conversão para BRL. Referência: 25/09/2026.

## Estrutura
- `src/data/fixture.json` — amostra sintética (4 contas, 22 transações).
- `src/lib/finance/data-source.ts` — ponto único de acesso aos dados (trocável por uma camada de serviços).
- `src/lib/finance/engine.ts` — cálculos (disponível, dívidas, filtros, categorias, padrões) e respostas.
- `src/components/chat/` — interface do chat.

## Testes
`bunx vitest run` — cobre somas, sinais, pendentes, categoria, recorte combinado, conjunto vazio e recusa de operações de escrita.
