"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ChatPanel from "@/component/chat/ChatPanel";


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

  const diff =
    Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return "Now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

  return d.toLocaleDateString();
}

export default function ChatListPage() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

const selectedConversation = searchParams.get("conversation");


  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

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
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="h-[calc(100vh-73px)] flex">
        <h1 className="text-3xl text-white">
          Loading chats...
        </h1>
      </main>
    );
  }

 return (
  <main className="h-[calc(100vh-64px)] flex overflow-hidden">

    {/* Left Sidebar */}
    <aside className="w-[380px] border-r border-zinc-800 bg-zinc-900 flex flex-col">

      <div className="p-5 border-b border-zinc-800">
        <h1 className="text-3xl font-bold text-white">
          Chats
        </h1>

        <input
          placeholder="Search conversations..."
          className="mt-4 w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-white placeholder:text-zinc-500 outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">

        {chats.length === 0 ? (
          <div className="flex h-full items-center justify-center text-zinc-400">
            No conversations
          </div>
        ) : (
          chats.map((chat) => (
            <Link
              key={chat.conversation.id}
             href={`/chat?conversation=${chat.conversation.id}`}
            >
              <div className="flex items-center gap-4 border-b border-zinc-800 px-5 py-4 hover:bg-zinc-800 transition">

                <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl uppercase">
                  {chat.otherUserName.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">

                  <div className="flex items-center justify-between">

                    <h2 className="truncate font-semibold text-white">
                      {chat.otherUserName}
                    </h2>

                    <span className="text-xs text-zinc-500">
                      {formatDate(chat.conversation.created_at)}
                    </span>

                  </div>

                  <p className="truncate text-sm text-blue-400">
                    {chat.productName}
                  </p>

                  <p className="truncate text-sm text-zinc-500">
                    Tap to continue chatting
                  </p>

                </div>

              </div>
            </Link>
          ))
        )}

      </div>

    </aside>

    {/* Right Side */}

    <section className="hidden md:flex flex-1 bg-[rgb(17,27,33)]">
  {selectedConversation ? (
    <ChatPanel conversationId={selectedConversation} />
  ) : (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <div className="mb-6 text-7xl"></div>

        <h2 className="text-3xl font-semibold text-white">
          Welcome to Chats
        </h2>

        <p className="mt-3 text-zinc-400">
          Select a conversation to start messaging.
        </p>
      </div>
    </div>
  )}
</section>

  </main>
)
};
