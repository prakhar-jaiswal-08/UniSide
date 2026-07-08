import ChatSidebar from "@/component/chat/ChatSidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-[calc(100vh-73px)] overflow-hidden bg-[#111b21]">

      {/* Desktop Sidebar */}
      <aside className="hidden w-[380px] shrink-0 border-r border-zinc-800 md:flex">
        <ChatSidebar />
      </aside>

      {/* Chat */}
      <section className="flex min-w-0 flex-1 flex-col">
        {children}
      </section>

    </main>
  );
}