import { MessageCircle } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="hidden min-h-full flex-1 items-center justify-center bg-gray-50 md:flex">
      <div className="mx-auto max-w-md px-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
          <MessageCircle
            size={30}
            className="text-gray-500"
          />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-gray-950">
          Welcome to Chats
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Select a conversation from the sidebar to
          start messaging with another student.
        </p>
      </div>
    </div>
  );
}