Prompt único para Lovable — Finança Clara (Etapa 1)
Instrução de uso: copie a partir de INÍCIO DO PROMPT até FIM DO PROMPT e cole no modo Chat do Lovable; não inclua os títulos e esta linha introdutória. A plataforma gera seu próprio código, que depois poderá ser publicado e sincronizado no GitHub. Não cole chaves de API nem contas pessoais.
INÍCIO DO PROMPT
Você é engenheiro de produto e frontend. Quero criar o Finança Clara, uma aplicação web de demonstração educacional do Bootcamp Bradesco/DIO, a partir da especificação das páginas 25 a 28 do guia “MCP sem complicação”. Primeiro, Etapa 1 totalmente funcional, sem credenciais e sem integrações externas. Trabalhe como um aplicativo em formato de chat, NÃO como landing page.
Contexto e posicionamento
O cliente já está dentro de um app fictício de banco digital. O assistente Finança Clara o ajuda a entender contas, saldos, dívidas, limites e transações por conversas em português brasileiro. O cliente não poderá realizar pagamentos, Pix, transferências, contratos ou movimentações de dinheiro. Nome da marca: Finança Clara. Nome do assistente: Finança Clara. Nunca use marcas bancárias reais como se o projeto lhes pertencesse.

Aviso obrigatório e sempre visível: “DEMONSTRAÇÃO · DADOS FICTÍCIOS”. Texto secundário: “Dados locais sintéticos · referência 25/09/2026 · sem conexão bancária ou atualização em tempo real”. A instituição da Pluggy/Plaid nunca será apresentada como conectada ao site. Em toda resposta financeira, repita de forma discreta a data de referência e a natureza fictícia.
Identidade visual e UX
- Layout profissional de banco digital: verde profundo (#112e2a), verde médio (#1d654f), branco/cinza claro, cards limpos e tipografia acessível.
- Monograma F+ e topo “Assistente financeiro / dados locais”. Barra lateral com Nova conversa e histórico de conversas da sessão. Conteúdo principal dedicado à conversa.
- Uma área inicial discreta com três indicadores: dinheiro disponível em contas de depósito, dívidas em cartões e número de movimentações fictícias.
- Campo de mensagem fixo ao rodapé, botão de enviar. Enter envia; Shift+Enter insere nova linha. Impedir envio de mensagens vazias. Indicar processamento local, mostrar erro compreensível em falhas, permitir nova conversa e consultar conversas anteriores na mesma sessão.
- Layout mobile e desktop, navegação lateral adaptada para celular. Textos legíveis; tabelas com rolagem horizontal acessível; gráficos simples na própria conversa.
- Sugestões clicáveis com envios reais: “Mostrar minhas contas”, “Consultar meus saldos”, “Ver minhas últimas transações”, “Quanto gastei com alimentação?”, “Resumir minhas movimentações” e “Quais são os três padrões de gasto?”.
Regras de comportamento e cálculo
1. A implementação desta primeira versão deve ser local, determinística (um motor de regras é suficiente), SEM chamar OpenAI, Claude, Plaid ou Pluggy. Não finja respostas de LLM ou endpoints que não foram invocados.
2. Os dados abaixo são a amostra completa e sintética desta implementação. Não diga que são as 14 contas e 48 transações do ensaio do instrutor. Quatro saldos de contas são os valores de exemplo do guia e as 22 transações foram criadas para esta demo.
3. Moeda USD apenas, com formatação brasileira como US$ 110,00. Sem conversão para BRL, porque nenhuma taxa cambial foi integrada.
4. Sinal da Plaid: transação amount > 0 = saída; amount < 0 = entrada. pending=true fica fora dos totais confirmados. Mostrar pendências separadamente.
5. Saldo atual de cartão é dívida, NÃO dinheiro disponível. O valor available de cartão é limite de crédito, NÃO dinheiro em conta. Valor ausente/null → “Não informado”. O indicador de dinheiro disponível soma apenas as contas de depósito: US$ 100 + US$ 200 = US$ 300,00. Dívidas de cartões somam US$ 5.430,00.
6. Transferência de contas e pagamentos de dívidas não são consumo automático. Exibir saídas confirmadas, entradas confirmadas, consumo (exceto Transferências e Pagamento de dívidas) em métricas distintas.
7. Filtros combináveis por período (toda a amostra / 7 / 30 / 60 dias), conta e categoria. Período relativo a 25/09/2026, não ao dia atual. Todas as tabelas/totais de transações devem usar o mesmo conjunto filtrado. Informar quantos registros foram analisados.
8. “Cinco transações mais recentes” lista 5 por data decrescente; separar valor e estado. Se houver menos, exibir apenas os existentes. Se não houver dados, dizer isso claramente, sem inventar.
9. “Gastos por categoria” calcula saídas confirmadas, agrupadas por categoria. “Padrões” apresenta até três observações rastreáveis no conjunto filtrado (categorias mais altas e repetição de Uber, quando aplicável), SEM inferir hábitos pessoais reais.
10. Perguntas não suportadas (previsão de investimentos, taxa de câmbio, operações bancárias, dados reais) devem explicar o limite e oferecer exemplos de perguntas válidas. Não inventar transações, datas, categorias, eventos ou recorrências.
Dados obrigatórios
Use o JSON abaixo exatamente como fixture local. Cada transação tem accountId que referencia um accounts.id. Os nomes de empresas são inventados e constituem dados fictícios. kind=liability indica dívida.
{
  "snapshotDate": "2026-09-25",
  "accounts": [
    {
      "id": "checking",
      "name": "Plaid Checking",
      "type": "Conta corrente",
      "kind": "asset",
      "current": 110,
      "available": 100,
      "currency": "USD"
    },
    {
      "id": "saving",
      "name": "Plaid Saving",
      "type": "Poupança",
      "kind": "asset",
      "current": 210,
      "available": 200,
      "currency": "USD"
    },
    {
      "id": "credit",
      "name": "Plaid Credit Card",
      "type": "Cartão de crédito",
      "kind": "liability",
      "current": 410,
      "available": null,
      "currency": "USD"
    },
    {
      "id": "business",
      "name": "Plaid Business Credit Card",
      "type": "Cartão empresarial",
      "kind": "liability",
      "current": 5020,
      "available": 4980,
      "currency": "USD"
    }
  ],
  "transactions": [
    {
      "id": "tx01",
      "date": "2026-09-24",
      "name": "Mercado Central",
      "amount": 68.2,
      "accountId": "checking",
      "category": "Alimentação",
      "pending": false
    },
    {
      "id": "tx02",
      "date": "2026-09-23",
      "name": "Uber",
      "amount": 12.8,
      "accountId": "checking",
      "category": "Transporte",
      "pending": false
    },
    {
      "id": "tx03",
      "date": "2026-09-22",
      "name": "Padaria Aurora",
      "amount": 14.3,
      "accountId": "checking",
      "category": "Alimentação",
      "pending": false
    },
    {
      "id": "tx04",
      "date": "2026-09-20",
      "name": "Livraria do Bairro",
      "amount": 32,
      "accountId": "credit",
      "category": "Compras",
      "pending": false
    },
    {
      "id": "tx05",
      "date": "2026-09-19",
      "name": "Pagamento de cliente (simulação)",
      "amount": -460,
      "accountId": "checking",
      "category": "Recebimentos",
      "pending": false
    },
    {
      "id": "tx06",
      "date": "2026-09-18",
      "name": "Uber",
      "amount": 18.4,
      "accountId": "credit",
      "category": "Transporte",
      "pending": false
    },
    {
      "id": "tx07",
      "date": "2026-09-16",
      "name": "Restaurante Lago",
      "amount": 48.9,
      "accountId": "checking",
      "category": "Alimentação",
      "pending": false
    },
    {
      "id": "tx08",
      "date": "2026-09-15",
      "name": "Internet residencial",
      "amount": 69.9,
      "accountId": "checking",
      "category": "Serviços",
      "pending": false
    },
    {
      "id": "tx09",
      "date": "2026-09-13",
      "name": "Transferência entre contas",
      "amount": 120,
      "accountId": "checking",
      "category": "Transferências",
      "pending": false
    },
    {
      "id": "tx10",
      "date": "2026-09-12",
      "name": "Crédito em conta (simulação)",
      "amount": -120,
      "accountId": "saving",
      "category": "Transferências",
      "pending": false
    },
    {
      "id": "tx11",
      "date": "2026-09-10",
      "name": "Cinema",
      "amount": 26,
      "accountId": "credit",
      "category": "Lazer",
      "pending": false
    },
    {
      "id": "tx12",
      "date": "2026-09-09",
      "name": "Uber",
      "amount": 9.5,
      "accountId": "checking",
      "category": "Transporte",
      "pending": false
    },
    {
      "id": "tx13",
      "date": "2026-09-05",
      "name": "Farmácia Central",
      "amount": 38.6,
      "accountId": "credit",
      "category": "Saúde",
      "pending": false
    },
    {
      "id": "tx14",
      "date": "2026-09-02",
      "name": "Supermercado Oeste",
      "amount": 84.75,
      "accountId": "business",
      "category": "Alimentação",
      "pending": false
    },
    {
      "id": "tx15",
      "date": "2026-08-28",
      "name": "Uber",
      "amount": 15.2,
      "accountId": "checking",
      "category": "Transporte",
      "pending": false
    },
    {
      "id": "tx16",
      "date": "2026-08-23",
      "name": "Assinatura de software",
      "amount": 24.99,
      "accountId": "business",
      "category": "Serviços",
      "pending": false
    },
    {
      "id": "tx17",
      "date": "2026-08-20",
      "name": "Pagamento de fatura",
      "amount": 145,
      "accountId": "checking",
      "category": "Pagamento de dívidas",
      "pending": false
    },
    {
      "id": "tx18",
      "date": "2026-08-14",
      "name": "Café Alameda",
      "amount": 13.6,
      "accountId": "checking",
      "category": "Alimentação",
      "pending": false
    },
    {
      "id": "tx19",
      "date": "2026-08-08",
      "name": "Salário simulado",
      "amount": -1250,
      "accountId": "checking",
      "category": "Recebimentos",
      "pending": false
    },
    {
      "id": "tx20",
      "date": "2026-08-02",
      "name": "Loja de roupas",
      "amount": 79.9,
      "accountId": "credit",
      "category": "Compras",
      "pending": false
    },
    {
      "id": "tx21",
      "date": "2026-09-25",
      "name": "Compra pendente - cafeteria",
      "amount": 11.5,
      "accountId": "checking",
      "category": "Alimentação",
      "pending": true
    },
    {
      "id": "tx22",
      "date": "2026-09-25",
      "name": "Crédito pendente - estorno",
      "amount": -7.4,
      "accountId": "credit",
      "category": "Recebimentos",
      "pending": true
    }
  ]
}
Organização técnica esperada
- Preferência: React + TypeScript + Tailwind se esse for o stack padrão do Lovable, sem banco e sem secrets. Alternativamente pode usar frontend estático se isso simplificar, desde que publique e sincronize.
- Separe fixture, motor financeiro de cálculo/resposta e interface em arquivos distintos para facilitar trocar a fonte de dados por uma camada de serviços futura.
- Evite armazenar dados em localStorage ou sessionStorage nesta demo; pode manter apenas o histórico em memória, durante a visita à página.
- Renderize conteúdo do chat como texto seguro. Não use HTML arbitrário do usuário. Garanta navegação por teclado e boas mensagens para tecnologias assistivas.
- Se criar testes automatizados, teste: soma de disponível/dívida, sinais, pendentes, categoria, recorte combinado, conjunto vazio e proibição de escrita.
- Deixe no README claro que o código desta etapa não acessa APIs bancárias e não usa IA generativa para interpretar dados, mesmo que a interface tenha a aparência de assistente conversacional.
MCPs, documentação e Etapa 2 FUTURA (não ligar agora)
- Pluggy Docs MCP: URL https://mcp.pluggy.ai/mcp (Streamable HTTP) é usado no Codex apenas para consultar documentação brasileira. GET /v2/transactions é a referência de listagem por cursor que deve ser conferida na documentação atual. Não transmite automaticamente dados ao site.
- Plaid MCP: mcp-server-plaid por STDIO com uvx no computador do desenvolvedor. Ajuda a criar Item em Sandbox. Não é uma API ativa no browser.
- Plaid Sandbox: em etapa futura, um backend seguro pode chamar somente https://sandbox.plaid.com com POST /accounts/get e POST /transactions/get, paginando todas as transações. As chaves PLAID_CLIENT_ID, PLAID_SECRET e PLAID_ACCESS_TOKEN só podem ficar no backend, nunca no navegador, no chat, em variável VITE_* ou no GitHub.
- A Etapa 1 NÃO pede credenciais e NÃO configura backend, Supabase, edge function, webhook, autenticação real nem chamada de LLM. Caso sugerir isso, apresente como trabalho futuro, sem implementar.
Critérios de aceitação
- O chat realmente funciona com os dados acima, no desktop e no celular.
- O indicador de dinheiro disponível é US$ 300,00; a dívida em cartões é US$ 5.430,00. O número de registros é 22, sendo 20 confirmados e 2 pendentes.
- Consultas, tabelas, categorias, cinco últimas e padrões retornam resultados verificáveis. O filtro ajusta corretamente os números e data.
- O texto deixa claro: nenhuma conexão financeira real, sem atualização em tempo real, sem segredo público, sem escrita bancária.
- Nova conversa e histórico são utilizáveis na mesma sessão. Enter e envio por botão funcionam. Sugestões clicáveis funcionam. Erros e resultados vazios são tratados.
- Exiba uma prévia; não publique automaticamente. Ao concluir, liste objetivamente o que funciona e o que ainda falta para a Etapa 2.
FIM DO PROMPT
Prompt P09 para revisão, depois que o Lovable gerar o projeto
Revise o Finança Clara criado com a especificação anterior. Teste o envio de mensagens, sugestões, contas, transações, cálculos, nova conversa, histórico, filtros combinados e responsividade no desktop e no celular. Confira os valores em USD, positivos/saídas, negativos/entradas, pendências, dívida e limite. Verifique se o aplicativo distingue demonstração local de integração bancária real. Corrija erros encontrados e liste apenas o que continua pendente. Não solicite secrets e não publique automaticamente.