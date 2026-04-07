"use client";

import dynamic from "next/dynamic";

const ChatbotWidget = dynamic(() => import("@/components/chatbot-widget").then((m) => m.ChatbotWidget), {
  ssr: false,
});
const SearchPalette = dynamic(() => import("@/components/search-palette").then((m) => m.SearchPalette), {
  ssr: false,
});

export function ClientWidgets() {
  return (
    <>
      <ChatbotWidget />
      <SearchPalette />
    </>
  );
}
