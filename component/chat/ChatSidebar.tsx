"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Conversation = {
  id: number;
  buyer_id: string;
  seller_id: string;
  product_id: number;
  created_at: string;
};

type ChatItem = {
  conversation: Conversation;
  otherUserName: string;
  productName: string;
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

export default function ChatSidebar() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const pathname = usePathname();

  const selectedId =
    pathname.startsWith("/chat/") ? Number(pathname.split("/")[2]) : null;

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: conversations } = await supabase
      .from("conversations")
      .select("*")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    const result: ChatItem[] = [];

    for (const conversation of conversations || []) {
      const otherUserId =
        conversation.buyer_id === user.id
          ? conversation.seller_id
          : conversation.buyer_id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", otherUserId)
        .single();

      const { data: product } = await supabase
        .from("products")
        .select("name")
        .eq("id", conversation.product_id)
        .single();

      result.push({
        conversation,
        otherUserName: profile?.name ?? "Unknown User",
        productName: product?.name ?? "Unknown Product",
      });
    }

    setChats(result);
  }

  return (
    <aside className="flex h-full w-full flex-col bg-[#202c33]">

      {/* Header */}
      <div className="border-b border-[#2a3942] p-4">

        <h1 className="text-2xl font-semibold text-white">
          Chats
        </h1>

        <input
          placeholder="Search conversations..."
          className="mt-4 w-full rounded-lg border border-[#2a3942] bg-[#111b21] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
        />

      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">

        {chats.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No conversations
          </div>
        )}

        {chats.map((chat) => {
          const active = selectedId === chat.conversation.id;

          return (
            <Link
              key={chat.conversation.id}
              href={`/chat/${chat.conversation.id}`}
            >
              <div
                className={`flex cursor-pointer items-center gap-4 border-b border-[#2a3942] px-4 py-4 transition ${
                  active
                    ? "bg-[#2a3942]"
                    : "hover:bg-[#2a3942]/60"
                }`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold uppercase text-white">
                  {chat.otherUserName.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex items-center justify-between">

                    <h2 className="truncate font-semibold text-white">
                      {chat.otherUserName}
                    </h2>

                    <span className="text-xs text-gray-400">
                      {formatDate(chat.conversation.created_at)}
                    </span>

                  </div>

                  <p className="mt-1 truncate text-sm text-blue-400">
                    {chat.productName}
                  </p>

                  <p className="truncate text-sm text-gray-500">
                    Tap to continue chatting
                  </p>

                </div>
              </div>
            </Link>
          );
        })}

      </div>

    </aside>
  );
}