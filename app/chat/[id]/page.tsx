"use client";

import { useParams } from "next/navigation";
import ChatPanel from "@/component/chat/ChatPanel";

export default function ChatPage() {
  const params = useParams();

  return (
    <ChatPanel
      conversationId={params.id as string}
    />
  );
}