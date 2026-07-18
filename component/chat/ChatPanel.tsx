"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

import ChatHeader from "./ChatHeader";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";

type Message = {
  id: number;
  conversation_id: number;
  sender_id: string;
  message: string;
  created_at: string;
};

type Props = {
  conversationId: string;
};

export default function ChatPanel({ conversationId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

  const [otherUser, setOtherUser] = useState("Loading...");
const [otherUserId, setOtherUserId] = useState("");
const [productName, setProductName] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChat();

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function loadChat() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUserId(user.id);

    const { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (conversation) {
      const otherUserId =
        conversation.buyer_id === user.id
          ? conversation.seller_id
          : conversation.buyer_id;
          setOtherUserId(otherUserId);

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", otherUserId)
        .single();

      setOtherUser(profile?.name ?? "Unknown");

      const { data: product } = await supabase
        .from("products")
        .select("name")
        .eq("id", conversation.product_id)
        .single();

      setProductName(product?.name ?? "");
    }

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at");

    setMessages(data || []);
    setLoading(false);
  }

  async function sendMessage() {
    if (!text.trim()) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      message: text,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setText("");
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[rgb(17,27,33)] text-white">
        Loading...
      </div>
    );
  }

 return (
  <div className="flex h-full w-full min-w-0 flex-1 flex-col">
    <ChatHeader
  otherUser={otherUser}
  otherUserId={otherUserId}
  productName={productName}
/>

    <ChatWindow
      messages={messages}
      currentUserId={userId}
      otherUser={otherUser}
      bottomRef={bottomRef}
    />

    <MessageInput
      text={text}
      setText={setText}
      onSend={sendMessage}
    />
  </div>
);
}