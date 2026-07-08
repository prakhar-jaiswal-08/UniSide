import ChatSidebar from "@/component/chat/ChatSidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-[calc(100vh-73px)] bg-[#111b21] overflow-hidden">

      <aside
        className="hidden md:block w-[380px] flex-none border-r border-zinc-800"
      >
        <ChatSidebar />
      </aside>

      <div className="flex-1 min-w-0 h-full">
        {children}
      </div>

    </main>
  );
}