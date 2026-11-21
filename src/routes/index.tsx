import { createFileRoute } from "@tanstack/react-router";
import { ChatApp } from "@/components/chat/ChatApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Finança Clara · Assistente financeiro (demonstração)" },
      { name: "description", content: "Chat educacional que explica contas, saldos, dívidas e transações fictícias. Sem conexão bancária." },
      { property: "og:title", content: "Finança Clara · Assistente financeiro (demonstração)" },
      { property: "og:description", content: "Chat educacional com dados sintéticos locais. Sem conexão bancária." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatApp,
});
