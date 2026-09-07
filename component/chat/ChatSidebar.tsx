"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Search, MessageSquare } from "lucide-react";
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
  lastMessage: string;
};

function formatDate(date: string) {
  const d = new Date(date);
  const now = new Date();

  const diff = Math.floor(
    (now.getTime() - d.getTime()) / 1000
  );

  if (diff < 60) return "Now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

  if (diff < 604800) {
    return d.toLocaleDateString([], {
      weekday: "short",
    });
  }

  return d.toLocaleDateString([], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ChatSidebar() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [search, setSearch] = useState("");

  const pathname = usePathname();

  const selectedId = pathname.startsWith("/chat/")
    ? Number(pathname.split("/")[2])
    : null;

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("*")
      .or(
        `buyer_id.eq.${user.id},seller_id.eq.${user.id}`
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Failed to load conversations:",
        error
      );
      return;
    }

    const result: ChatItem[] = [];

    for (const conversation of conversations || []) {
      const otherUserId =
        conversation.buyer_id === user.id
          ? conversation.seller_id
          : conversation.buyer_id;

      const { data: profile } = await supabase
        .from("public_profiles")
        .select("id, name")
        .eq("id", otherUserId)
        .maybeSingle();

      const { data: product } = await supabase
        .from("products")
        .select("name")
        .eq("id", conversation.product_id)
        .maybeSingle();

      const { data: lastMessage } = await supabase
        .from("messages")
        .select("message")
        .eq("conversation_id", conversation.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      result.push({
        conversation,
        otherUserName:
          profile?.name ?? "Unknown User",
        productName:
          product?.name ?? "Unknown Product",
        lastMessage:
          lastMessage?.message ?? "No messages yet",
      });
    }

    setChats(result);
  }

  const filteredChats = chats.filter((chat) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      chat.otherUserName
        .toLowerCase()
        .includes(query) ||
      chat.productName
        .toLowerCase()
        .includes(query) ||
      chat.lastMessage
        .toLowerCase()
        .includes(query)
    );
  });

  return (
    <aside className="flex h-full w-full flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-5 py-5">
        <div className="flex items-center gap-2">
          <MessageSquare
            size={21}
            className="text-gray-700"
          />

          <h1 className="text-2xl font-semibold tracking-tight text-gray-950">
            Chats
          </h1>
        </div>

        <div className="relative mt-4">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:bg-white focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {filteredChats.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
              <MessageSquare
                size={21}
                className="text-gray-400"
              />
            </div>

            <p className="mt-4 text-sm font-medium text-gray-700">
              No conversations
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Your messages will appear here.
            </p>
          </div>
        )}

        {filteredChats.map((chat) => {
          const active =
            selectedId === chat.conversation.id;

          return (
            <Link
              key={chat.conversation.id}
              href={`/chat/${chat.conversation.id}`}
              className="block"
            >
              <div
                className={`flex items-center gap-3 border-b border-gray-200 px-4 py-4 transition ${
                  active
                    ? "bg-white shadow-[inset_3px_0_0_#111827]"
                    : "bg-gray-50 hover:bg-white"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase ${
                    active
                      ? "bg-gray-900 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {chat.otherUserName.charAt(0)}
                </div>

                {/* Conversation info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h2
                      className={`truncate text-sm font-semibold ${
                        active
                          ? "text-gray-950"
                          : "text-gray-800"
                      }`}
                    >
                      {chat.otherUserName}
                    </h2>

                    <span className="shrink-0 text-[11px] text-gray-400">
                      {formatDate(
                        chat.conversation.created_at
                      )}
                    </span>
                  </div>

                  <p
                    className={`mt-1 truncate text-xs font-medium ${
                      active
                        ? "text-gray-700"
                        : "text-gray-500"
                    }`}
                  >
                    {chat.productName}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {chat.lastMessage}
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