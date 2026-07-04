"use client";

import Link from "next/link";

type Chat = {
  conversation: {
    id: number;
    created_at: string;
  };
  otherUserName: string;
  productName: string;
};

type Props = {
  chats: Chat[];
  selectedId?: number;
};

function formatDate(date: string) {
  const d = new Date(date);
  const now = new Date();

  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return "Now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

  return d.toLocaleDateString();
}

export default function ChatSidebar({
  chats,
  selectedId,
}: Props) {
  return (
    <aside className="w-full md:w-96 border-r border-zinc-800 bg-zinc-900 flex flex-col">

      <div className="p-5 border-b border-zinc-800">
        <h1 className="text-3xl font-bold text-white">
          Chats
        </h1>

        <input
          placeholder="Search chats..."
          className="mt-4 w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white placeholder:text-gray-500"
        />
      </div>

      <div className="overflow-y-auto flex-1">

        {chats.map((chat) => {

          const active =
            chat.conversation.id === selectedId;

          return (
            <Link
              key={chat.conversation.id}
              href={`/chat/${chat.conversation.id}`}
            >
              <div
                className={`flex items-center gap-4 px-5 py-4 border-b border-zinc-800 hover:bg-zinc-800 transition cursor-pointer ${
                  active
                    ? "bg-zinc-800"
                    : ""
                }`}
              >

                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase">
                  {chat.otherUserName.charAt(0)}
                </div>

                <div className="flex-1">

                  <h2 className="font-semibold text-white">
                    {chat.otherUserName}
                  </h2>

                  <p className="text-sm text-blue-400">
                    {chat.productName}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Tap to continue chatting
                  </p>

                </div>

                <span className="text-xs text-gray-500">
                  {formatDate(
                    chat.conversation.created_at
                  )}
                </span>

              </div>
            </Link>
          );
        })}

      </div>

    </aside>
  );
}