# Finança Clara — Etapa 1

Entrega educacional para o **Bootcamp Bradesco/DIO**, inspirada nas páginas 25–28 do guia **“MCP sem complicação”**, conforme a especificação fornecida pelo participante.

**Aplicativo publicado:** https://financa-clara-mcp.lovable.app/

> **DEMONSTRAÇÃO · DADOS FICTÍCIOS.** A Etapa 1 utiliza exclusivamente dados sintéticos locais. Os MCPs externos Pluggy e Plaid **não estão integrados ao aplicativo publicado**. Nenhuma instituição financeira está conectada. As respostas são calculadas por regras locais, sem IA generativa, sem atualização em tempo real e sem movimentação de dinheiro.

## 1. Objetivo e cenário de uso

Demonstrar como uma interface conversacional pode ajudar um cliente a compreender contas, saldos, dívidas, limites e transações em português brasileiro. O cenário simula um cliente já dentro de um aplicativo fictício de banco digital; não há autenticação bancária real.

O Finança Clara é um **aplicativo de chat**, não uma landing page, um banco ou um serviço de aconselhamento financeiro. A referência ao Bootcamp identifica o contexto acadêmico; não atribui propriedade ou vínculo oficial com instituições bancárias.

## 2. Funcionalidades implementadas

- Consulta das quatro contas e de seus saldos atuais, valores disponíveis e limites.
- Indicadores iniciais de dinheiro disponível, dívida dos cartões e quantidade de movimentações.
- Cinco transações mais recentes, com data, descrição, conta, direção do valor e estado.
- Gastos por categoria, tabela de transações e barras de saídas confirmadas.
- Resumo de entradas, saídas e consumo, com pendências apresentadas separadamente.
- Até três observações rastreáveis sobre categorias e repetição de Uber, sem inferir hábitos reais.
- Filtros combináveis por período (amostra completa, 7, 30 ou 60 dias), conta e categoria.
- Seis sugestões clicáveis que enviam perguntas; envio por botão ou Enter; Shift+Enter insere uma nova linha.
- Nova conversa e histórico da visita, mantidos somente em memória e descartados ao recarregar a página.
- Menu lateral adaptado para celular e tabelas com rolagem horizontal e região acessível por teclado.
- Aviso permanente de demonstração e referência dos dados nas respostas.
- Bloqueio de mensagens vazias, indicação de processamento local, tratamento de erro de processamento, resultados vazios e perguntas não reconhecidas.
- Recusa de pedidos de Pix, pagamentos, transferências e outras operações de escrita; explicação de limites para câmbio e investimentos.

### Origem dos dados

A amostra está em [`src/data/fixture.json`](src/data/fixture.json): **4 contas e 22 transações**, sendo **20 confirmadas e 2 pendentes**, com referência fixa em **25/09/2026**.

Segundo a especificação recebida, os quatro saldos reproduzem valores de exemplo do guia; as 22 transações foram criadas para esta demonstração e fornecidas no prompt original. Não foram consultadas em uma API, exportadas de um MCP nem geradas por um LLM durante a execução. **Não se trata das 14 contas e 48 transações do ensaio do instrutor.** Os nomes “Plaid Checking”, “Plaid Saving” e dos cartões são rótulos da amostra, não evidência de conexão com Plaid.

### Regras financeiras preservadas

| Regra | Comportamento da Etapa 1 |
| --- | --- |
| Moeda | USD, com formatação brasileira, por exemplo `US$ 110,00`; sem conversão para BRL |
| Sinais | `amount > 0` é saída; `amount < 0` é entrada |
| Pendentes | `pending=true` fica fora dos totais confirmados, mas pode aparecer nas tabelas |
| Disponível | Soma apenas o disponível das contas de depósito; limite de cartão não é dinheiro |
| Dívida | Soma o saldo atual dos cartões |
| Valores ausentes | Exibidos como “Não informado” |
| Consumo | Exclui Transferências e Pagamento de dívidas das saídas confirmadas |
| Período | Relativo à data da amostra, não ao relógio atual; diferença de dias entre zero e `período - 1` |
| Filtros | Aplicados às análises de transações; contas, saldos e indicadores iniciais continuam mostrando a amostra completa |
| Categoria na pergunta | Restringe ainda mais o conjunto já filtrado; não remove os filtros selecionados |

## 3. Arquitetura e fluxo das perguntas

Aplicação em **React 19 + TypeScript**, com **TanStack Start/Router**, **Vite**, **Tailwind CSS v4** e testes em **Vitest**. Versões e comandos efetivos estão em [`package.json`](package.json); as dependências são fixadas por [`bun.lock`](bun.lock). A estrutura oferece renderização da página e hospedagem, mas a análise financeira ocorre localmente, sem serviço financeiro externo.

| Caminho existente | Responsabilidade |
| --- | --- |
| [`src/routes/index.tsx`](src/routes/index.tsx) | Página principal do chat e metadados específicos |
| [`src/routes/__root.tsx`](src/routes/__root.tsx) | Estrutura compartilhada, estilos, fontes e tratamento de erro da página |
| [`src/components/chat/ChatApp.tsx`](src/components/chat/ChatApp.tsx) | Conversas em memória, filtros, envio e estado de processamento |
| [`src/components/chat/MessageBlocks.tsx`](src/components/chat/MessageBlocks.tsx) | Renderização de texto, métricas, tabelas, barras e sugestões |
| [`src/lib/finance/data-source.ts`](src/lib/finance/data-source.ts) | Único ponto de leitura da amostra, preparado para troca futura da fonte |
| [`src/lib/finance/types.ts`](src/lib/finance/types.ts) | Tipos de contas, transações, filtros e respostas |
| [`src/lib/finance/engine.ts`](src/lib/finance/engine.ts) | Reconhecimento de intenção, filtros, cálculos e respostas |
| [`src/data/fixture.json`](src/data/fixture.json) | Dados sintéticos locais |
| [`src/styles.css`](src/styles.css) | Identidade visual e tokens de estilo |
| [`vite.config.ts`](vite.config.ts) | Configuração de desenvolvimento e compilação |
| [`AGENTS.md`](AGENTS.md) | Regras técnicas do projeto |

```text
Pergunta digitada ou sugestão clicada + filtros selecionados
    -> ChatApp valida a mensagem e registra a pergunta em memória
    -> respond recebe texto, Dataset obtido por getDataset e filtros
    -> normalização de acentos/caixa e reconhecimento por regras
    -> recusa/limite OU filtragem e cálculos locais
    -> Reply com Block[] e referência dos dados
    -> MessageBlocks renderiza a resposta na conversa
```

O motor reconhece intenções por expressões e palavras-chave: não é um modelo de linguagem nem um cliente MCP. A espera de aproximadamente 350 ms simula processamento na interface, não uma chamada remota. O motor e a interface nunca importam a amostra diretamente: usam o ponto único de acesso. Respostas são dados estruturados `Block[]`, renderizados como texto React, sem HTML arbitrário do usuário.

Não há banco de dados, chaves financeiras, armazenamento de histórico em `localStorage`/`sessionStorage`, autenticação real, webhook ou chamada a OpenAI/Claude. “Local” descreve os **dados e cálculos financeiros**: a página pode carregar fontes do Google e recursos da hospedagem; o template inclui mecanismos de diagnóstico do Lovable. Isso não constitui integração financeira.

## 4. Executar e testar o aplicativo

Pré-requisitos: Git (se usar clonagem), Bun e um ambiente Node.js compatível com o Vite instalado (Node.js 22.12+ é uma referência compatível). Use as instruções oficiais do [Bun](https://bun.sh/docs/installation) e do [Node.js](https://nodejs.org/en/download). Execute na pasta que contém `package.json`:

```sh
bun install --frozen-lockfile
bun run dev -- --host 0.0.0.0 --port 8080
```

Acesse `http://localhost:8080/`. **A Etapa 1 não exige arquivo de ambiente nem credenciais.** O desenvolvimento no Lovable já possui uma prévia gerenciada; não é necessário iniciar um segundo servidor nela.

```sh
bun run test
bun run build
```

O primeiro comando executa os testes; o segundo gera a compilação de produção na configuração existente. No Lovable, a compilação é automática após alterações: a revisão abaixo utiliza esse resultado, sem executar uma compilação manual adicional. A configuração atual tem alvo de hospedagem Cloudflare; hospedar em outro serviço pode exigir adaptar a configuração desse serviço.

**Windows 11:** os comandos Bun acima também podem ser usados no PowerShell após a instalação. Abra um novo terminal para atualizar o PATH e confira `bun --version` e `node --version`. Não é necessário configurar MCPs para executar ou avaliar a Etapa 1.

## 5. MCPs externos — configuração opcional, fora do aplicativo

Esta seção orienta um laboratório **no computador do desenvolvedor**, não descreve uma integração entregue. Não adiciona dependências ao chat nem conecta o site publicado. Os procedimentos foram revisados contra documentação oficial, mas **não foram executados com credenciais ou em Windows 11 nesta entrega**.

### Pluggy Docs MCP — Streamable HTTP

Servidor: `https://mcp.pluggy.ai/mcp`. Para consulta de documentação pública, não é necessária chave de API nem login. A documentação atual também oferece recursos opcionais de portal mediante login; eles **não foram utilizados ou validados neste projeto**.

Em um Codex atual com suporte a Streamable HTTP, adicione ao arquivo de configuração pessoal do cliente (fora do repositório):

```toml
[mcp_servers.pluggy-docs]
url = "https://mcp.pluggy.ai/mcp"
```

No Codex, o arquivo pessoal padrão é `~/.codex/config.toml`; no Windows 11, corresponde a `$HOME\.codex\config.toml`. Estes são **caminhos externos do computador do usuário**, não arquivos existentes neste repositório. Reinicie o cliente e use `codex mcp list` e `/mcp` para inspecionar os servidores. A listagem isolada não comprova uma chamada: faça uma pergunta documental e verifique o resultado e sua fonte.

A página da Pluggy também fornece uma ponte STDIO para clientes antigos que não aceitam HTTP diretamente. Como alternativa, e **não junto ao bloco anterior com o mesmo nome**, use:

```toml
[mcp_servers.pluggy-docs]
command = "npx"
args = ["-y", "mcp-remote", "https://mcp.pluggy.ai/mcp"]
```

Essa alternativa requer Node.js/npm e acesso à internet. No Windows, se `npx` não for encontrado pelo cliente, tente `command = "npx.cmd"` ou o caminho absoluto retornado por `Get-Command npx.cmd`. Para o modo HTTP nativo, essa ponte não é necessária.

Pergunta sugerida para o laboratório: “Confira na referência atual como listar transações em `GET /v2/transactions`, incluindo parâmetros, cursor e término da paginação; cite a documentação.” Esse endpoint vem da especificação recebida; **sua paginação não foi implementada nem exercitada neste projeto**. Consultar documentação não transmite dados automaticamente ao site.

Fontes: [Pluggy MCP](https://docs.pluggy.ai/en/docs/developer-tools/mcp), [endereço atual e clientes](https://docs.pluggy.ai/en/mcp) e [configuração MCP do Codex](https://developers.openai.com/codex/mcp).

### Plaid Sandbox MCP — STDIO com uvx

Use o servidor oficial **`mcp-server-plaid`**, mantido no [Plaid AI Coding Toolkit](https://github.com/plaid/ai-coding-toolkit/blob/main/sandbox/README.md). Não confundir com outros servidores de terceiros ou com o Plaid Dashboard MCP.

1. Crie ou use uma conta no [Plaid Developer Dashboard](https://dashboard.plaid.com/) e obtenha **somente credenciais Sandbox** em Developers → Keys.
2. Instale `uv`, que inclui `uvx`, pelas [instruções oficiais](https://docs.astral.sh/uv/getting-started/installation/).
3. No **Windows 11 / PowerShell**, uma opção é:

   ```powershell
   winget install --id=astral-sh.uv -e
   ```

   Abra um novo terminal e confira `uv --version`, `uvx --version` e `Get-Command uvx`. Se o cliente não localizar o executável, use o caminho completo de `uvx.exe` em `command`, com barras `/` ou barras invertidas escapadas no TOML. Se usar WSL, instale e configure tudo dentro do WSL, sem misturar executáveis e configurações Windows/Linux.

4. No arquivo **pessoal** do Codex, configure o processo STDIO e encaminhe as variáveis do ambiente local, sem gravar seus valores:

   ```toml
   [mcp_servers.plaid]
   command = "uvx"
   args = ["mcp-server-plaid"]
   env_vars = ["PLAID_CLIENT_ID", "PLAID_SECRET"]
   ```

   O servidor aceita essas variáveis como alternativa a `--client-id` e `--secret`, conforme o [código oficial](https://github.com/plaid/ai-coding-toolkit/blob/main/sandbox/src/mcp_server_plaid/server.py). Não coloque valores reais nos argumentos, no README ou em configurações compartilhadas.

5. Disponibilize as variáveis somente ao processo local. Exemplo no PowerShell, solicitando valores sem registrá-los como comandos no histórico:

   ```powershell
   $env:PLAID_CLIENT_ID = Read-Host "Client ID Sandbox"
   $secret = Read-Host "Secret Sandbox" -AsSecureString
   $env:PLAID_SECRET = [System.Net.NetworkCredential]::new("", $secret).Password
   try {
       codex
   } finally {
       Remove-Item Env:PLAID_CLIENT_ID, Env:PLAID_SECRET -ErrorAction SilentlyContinue
       $secret = $null
   }
   ```

   O segredo precisa ficar em texto no ambiente do processo para o servidor lê-lo; isso não é um cofre. Prefira um gerenciador de segredos local quando disponível e não imprima variáveis. O cliente deve ser iniciado desse terminal para herdá-las; uma extensão de IDE já aberta pode não herdá-las. Não use `setx` para persistir segredos por conveniência.

6. Confira `codex mcp list`, reinicie o cliente quando necessário e verifique as ferramentas. No laboratório, `get_sandbox_access_token` pode criar/obter um Item e token **de teste**; trate o retorno como segredo e não o registre em prints, chat de entrega ou Git. O toolkit também oferece consulta documental, geração de prompts de dados fictícios e simulação de webhook; nada disso foi invocado nesta revisão.

Em outro cliente MCP, adapte ao seu formato de configuração de **usuário**, mantendo `uvx`, o argumento `mcp-server-plaid` e as variáveis locais. Não copie uma configuração com segredos para a pasta do aplicativo.

### O que seria necessário para a Etapa 2

Uma integração real exige uma camada segura no servidor, validação de acesso e autorização, tratamento de erros e paginação. Para um laboratório Plaid Sandbox, a especificação prevê chamadas apenas a `https://sandbox.plaid.com`, usando `POST /accounts/get` e `POST /transactions/get` (paginação por `count`/`offset` até cobrir `total_transactions`, conforme a [referência oficial](https://plaid.com/docs/api/products/transactions/#transactionsget)).

`PLAID_CLIENT_ID`, `PLAID_SECRET` e `PLAID_ACCESS_TOKEN` devem permanecer no servidor/gerenciador de segredos. **Nunca no navegador, em variáveis `VITE_*`, no GitHub ou em evidências públicas.** Não há tais chamadas, servidor financeiro, tokens ou Items de teste conectados na Etapa 1. A configuração MCP do desenvolvedor e uma integração de dados do aplicativo são trabalhos distintos.

## 6. Especificação utilizada e ajustes posteriores

A fonte executável do escopo é o prompt fornecido pelo participante, preservado em [`docs/especificacao-etapa-1.md`](docs/especificacao-etapa-1.md), incluindo a amostra JSON, regras de cálculo, critérios de aceitação, instruções de MCP futuro e o prompt P09 de revisão.

O documento aponta as páginas 25–28 de “MCP sem complicação”. **O PDF integral do guia não está no repositório e não foi conferido nesta revisão**; não se afirma reprodução literal dessas páginas. A origem dos exemplos do guia é atribuída ao prompt recebido.

O ajuste de escopo explícito da Etapa 1 foi separar o estudo de MCP de uma demonstração funcional sem credenciais: quatro contas e 22 transações locais, respostas determinísticas e bloqueio de escrita. Na implementação existente há separação entre fonte de dados, motor e interface, testes dos cálculos e tratamento de filtros/vazios.

**Revisão final de 21/11/2026 (esta entrega):** ampliação deste README, inclusão da especificação original no repositório, conferência da aplicação e auditoria do código disponível. **Não foram alteradas a lógica financeira nem a interface funcional**, nem implementadas integrações externas. Sem histórico anterior completo, não se atribuem melhorias a commits ou ensaios que não puderam ser observados.

## 7. Testes realizados e resultados

### Testes automatizados — executados em 21/11/2026

Comando: `bunx vitest run`. Resultado: **14 testes aprovados, 2 arquivos aprovados**.

- [`src/lib/finance/engine.test.ts`](src/lib/finance/engine.test.ts): 13 testes de disponível, dívida, valor ausente, contagem/pendências, sinais, consumo, alimentação, filtros combinados, janela de 7 dias, cinco últimas/menos registros, conjunto vazio, recusa de escrita, limites de perguntas e padrões.
- [`src/test/app-routing.test.tsx`](src/test/app-routing.test.tsx): 1 teste de correspondência da página `/`.
- Configuração: [`vitest.config.ts`](vitest.config.ts) e [`src/test/setup.ts`](src/test/setup.ts).

| Resultado verificado na amostra completa | Valor |
| --- | --- |
| Disponível das contas de depósito | US$ 300,00 |
| Dívida dos cartões | US$ 5.430,00 |
| Registros | 22 = 20 confirmados + 2 pendentes |
| Saídas confirmadas | US$ 822,04 |
| Entradas confirmadas | US$ 1.830,00 |
| Consumo | US$ 557,04 |
| Alimentação confirmada | US$ 229,75 |
| Alimentação pendente (fora do total) | US$ 11,50 |
| Uber | 4 saídas confirmadas, US$ 55,90 |
| 30 dias + conta corrente + Transporte | 3 registros, US$ 37,50 em saídas |

### Conferência da interface — prévia local

Executada com Chromium/Playwright no computador (**1280 × 1800**) e celular (**390 × 844**):

- As seis sugestões enviaram perguntas e retornaram contas, saldos, cinco últimas, alimentação, resumo e padrões.
- Filtros combinados retornaram os três registros e US$ 37,50; filtro de 7 dias + cartão empresarial retornou conjunto vazio, sem dados inventados.
- Pedidos de Pix e cotação receberam recusa/limite.
- Nova conversa, retorno ao histórico, envio por botão, Enter, Shift+Enter, desativação do envio vazio e descarte do histórico após recarga foram conferidos.
- No celular, menu, nova conversa, envio e apresentação da tabela foram conferidos; não houve transbordamento horizontal da página (a tabela possui rolagem própria).
- Nenhum erro de execução foi capturado durante esse roteiro. Isso não equivale a uma auditoria completa de acessibilidade ou de todos os navegadores.

O tratamento de exceção no processamento foi conferido no código, **sem provocar uma falha artificial na interface**. Instalação Windows e MCPs autenticados não foram testados. Os testes descritos não exercitam APIs Pluggy/Plaid nem IA generativa.

### Compilação e endereço publicado

- Registro de compilação automática do Lovable em **21/11/2026 às 22:55:28 UTC: `build OK`**, com o código funcional preservado.
- O endereço publicado respondeu **HTTP 200**, com título “Finança Clara · Assistente financeiro (demonstração)” e nome do aplicativo no HTML.
- O roteiro completo do chat foi executado na **prévia local**, não na versão publicada; HTTP 200 não prova equivalência de versões nem funcionamento ponta a ponta no endereço público.

## 8. Segurança e integridade da entrega

- Auditoria com **Gitleaks 8.30.1**, com valores ocultados, sobre a árvore versionada e o histórico Git disponível. Não foram identificados segredos pelos detectores utilizados; isso não é garantia absoluta de ausência de credenciais.
- O histórico disponível nesta revisão contém **2 commits**; a conclusão não cobre branches, commits remotos indisponíveis, configurações pessoais de MCP ou segredos de outros ambientes.
- Não há arquivos de credenciais reconhecíveis versionados, nem integrações financeiras ativas no código analisado. Nomes de variáveis em exemplos são instruções, não valores reais.
- Os caminhos relativos do repositório mencionados neste README foram conferidos. Caminhos pessoais de configuração MCP são explicitamente externos e só existirão após configuração pelo participante.
- Se futuramente um segredo for exposto, revogue/rotacione no provedor; apagar apenas o arquivo atual não remove o segredo do histórico.

### GitHub

As alterações desta entrega são salvas em commit para a sincronização Git configurada no Lovable. Não houve push manual, troca de branch ou reescrita de histórico. **O agente não consegue confirmar a conexão ou o estado remoto do GitHub.** Confira em Lovable → Configurações do projeto → Git se a conexão está ativa e se o commit chegou ao repositório; se ainda não houver conexão, conectá-la é uma pendência do participante.

Referência: [sincronização Git do Lovable](https://docs.lovable.dev/integrations/git-sync-overview). Salvar documentação em Git não publica uma nova versão do aplicativo; esta revisão não solicita nova publicação.

## 9. Melhorias implementadas e limites

**Melhorias presentes no aplicativo:** separação de dívida e disponível, exclusão de pendências dos totais, distinção entre consumo e outras saídas, recortes consistentes de transações, observações verificáveis, respostas vazias explícitas, apresentação segura de texto e histórico apenas da visita. Nesta revisão, a melhoria entregue é documental: escopo, configuração opcional, fontes, resultados e pendências agora ficam rastreáveis.

**Limitações atuais:** vocabulário reconhecido por regras, dados fixos, ausência de atualização em tempo real, moeda apenas USD, histórico não persistente, ausência de login e de integrações externas. Não há previsão financeira, recomendação de investimento, pagamento ou acesso a dados pessoais/bancários reais. A existência de testes não certifica conformidade regulatória ou segurança de uma integração futura.

**Possibilidades de evolução, não implementadas:**

1. Substituir a fonte local por uma camada de serviços segura, mantendo o contrato de dados e os cálculos testados.
2. Integrar Plaid Sandbox ou Pluggy em ambiente separado, com autorização, segredos no servidor e paginação completa.
3. Validar contratos de dados, moedas, categorias, estados pendentes e erros dos provedores antes de usar os dados na interface.
4. Ampliar testes de interface, navegadores, acessibilidade e instalação em Windows 11.
5. Adicionar persistência/autenticação apenas com escopo definido, consentimento e isolamento de dados por usuário.
6. Avaliar interpretação de perguntas por IA com respostas ancoradas em dados verificáveis, sem delegar cálculos ou autorizar movimentações automaticamente.

## 10. Pendências para a entrega

- Confirmar no painel Git do Lovable e no GitHub o recebimento do commit desta revisão; essa confirmação remota não está disponível ao agente.
- Se exigido pela avaliação, anexar o guia original e conferir diretamente as páginas 25–28; o prompt utilizado já está preservado.
- Se exigidas evidências de laboratório MCP, executar a configuração no computador do participante (inclusive Windows 11) e registrar resultados **sem segredos**, separados da demonstração publicada.
- Se exigida validação completa do endereço publicado, repetir nele o roteiro do chat; nesta revisão o endereço foi conferido por HTTP e o roteiro completo pela prévia.

Integrações financeiras e IA generativa pertencem à Etapa 2, **não são funcionalidades faltantes prometidas para a Etapa 1**. Nenhuma evidência externa foi inventada.
