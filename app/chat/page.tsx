export default function ChatPage() {
  return (
    <div className="hidden md:flex h-full items-center justify-center bg-[rgb(17,27,33)]">
      <div className="text-center">
        <div className="mb-6 text-7xl"></div>

        <h1 className="text-3xl font-bold text-white">
          Welcome to Chats
        </h1>

        <p className="mt-3 text-zinc-400">
          Select a conversation to start messaging.
        </p>
      </div>
    </div>
  );
}