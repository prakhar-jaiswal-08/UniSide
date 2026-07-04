"use client";

import { useParams } from "next/navigation";
import ChatPanel from "@/component/chat/ChatPanel";

export default function ChatPage() {
  const { id } = useParams();

  return (
    <main className="h-[calc(100vh-73px)]">
      <ChatPanel conversationId={id as string} />
    </main>
  );
}