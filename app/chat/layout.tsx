"use client";

import { usePathname } from "next/navigation";
import ChatSidebar from "@/component/chat/ChatSidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isConversation = pathname.startsWith("/chat/");

  return (
    <main className="flex h-[calc(100vh-73px)] overflow-hidden bg-[#111b21]">
      
      {/* Chat Sidebar */}
      <aside
        className={`w-full flex-none border-r border-zinc-800 ${
          isConversation
            ? "hidden md:block md:w-[380px]"
            : "block md:w-[380px]"
        }`}
      >
        <ChatSidebar />
      </aside>

      {/* Chat Content */}
      <div
        className={`min-w-0 flex-1 ${
          isConversation
            ? "block"
            : "hidden md:block"
        }`}
      >
        {children}
      </div>

    </main>
  );
}