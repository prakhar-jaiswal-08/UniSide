"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  CircleAlert,
  RefreshCw,
} from "lucide-react";

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

export default function ChatPanel({
  conversationId,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [otherUser, setOtherUser] =
    useState("Loading...");
  const [otherUserId, setOtherUserId] =
    useState("");
  const [productName, setProductName] =
    useState("");
  const [listingUrl, setListingUrl] =
    useState("");

  const bottomRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function initializeChat() {
      setLoading(true);
      setError(false);

      setMessages([]);
      setUserId("");
      setOtherUserId("");
      setOtherUser("Loading...");
      setProductName("");
      setListingUrl("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        setError(true);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const {
        data: conversation,
        error: conversationError,
      } = await supabase
        .from("conversations")
        .select(
          "id, buyer_id, seller_id, listing_type, listing_id, product_id"
        )
        .eq("id", conversationId)
        .single();

      if (cancelled) return;

      if (
        conversationError ||
        !conversation
      ) {
        console.error(
          "Failed to load conversation:",
          conversationError
        );

        setError(true);
        setLoading(false);
        return;
      }

      const otherUserId =
        conversation.buyer_id === user.id
          ? conversation.seller_id
          : conversation.buyer_id;

      setOtherUserId(otherUserId);

      // Load other user's public profile.
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("public_profiles")
        .select("name")
        .eq("id", otherUserId)
        .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        console.error(
          "Failed to load profile:",
          profileError
        );

        setError(true);
        setLoading(false);
        return;
      }

      setOtherUser(
        profile?.name ?? "Unknown"
      );

      /*
       * listing_type is the source of truth.
       *
       * Supported conversation types:
       * product
       * service
       * roommate
       * feed
       * profile
       */

      const listingType =
        conversation.listing_type;

      const listingId =
        conversation.listing_id
          ? String(
              conversation.listing_id
            )
          : "";

      if (listingType === "profile") {
        /*
         * Profile conversations are direct
         * user-to-user chats.
         */
        setProductName(
          "Direct conversation"
        );
        setListingUrl("");
      } else if (
        listingType &&
        listingId
      ) {
        if (listingType === "product") {
          const {
            data: product,
            error: productError,
          } = await supabase
            .from("products")
            .select("name")
            .eq("id", listingId)
            .maybeSingle();

          if (cancelled) return;

          if (productError) {
            console.error(
              "Failed to load product:",
              productError
            );

            setError(true);
            setLoading(false);
            return;
          }

          if (product) {
            setProductName(
              product.name
            );
            setListingUrl(
              `/products/${listingId}`
            );
          }
        }

        if (listingType === "service") {
          const {
            data: service,
            error: serviceError,
          } = await supabase
            .from("services")
            .select("title")
            .eq("id", listingId)
            .maybeSingle();

          if (cancelled) return;

          if (serviceError) {
            console.error(
              "Failed to load service:",
              serviceError
            );

            setError(true);
            setLoading(false);
            return;
          }

          if (service) {
            setProductName(
              service.title
            );
            setListingUrl(
              `/services/${listingId}`
            );
          }
        }

        if (listingType === "roommate") {
          const {
            data: roommate,
            error: roommateError,
          } = await supabase
            .from("roommates")
            .select("name")
            .eq("id", listingId)
            .maybeSingle();

          if (cancelled) return;

          if (roommateError) {
            console.error(
              "Failed to load roommate:",
              roommateError
            );

            setError(true);
            setLoading(false);
            return;
          }

          if (roommate) {
            setProductName(
              roommate.name
            );
            setListingUrl(
              `/roommates/${listingId}`
            );
          }
        }

        if (listingType === "feed") {
          const {
            data: post,
            error: postError,
          } = await supabase
            .from("feed_posts")
            .select("id, content")
            .eq("id", listingId)
            .maybeSingle();

          if (cancelled) return;

          if (postError) {
            console.error(
              "Failed to load feed post:",
              postError
            );

            setError(true);
            setLoading(false);
            return;
          }

          if (post) {
            const preview =
              post.content?.trim() ||
              "Campus Feed Post";

            setProductName(
              preview.length > 45
                ? `${preview.slice(
                    0,
                    45
                  )}...`
                : preview
            );

            setListingUrl(
              `/feed#post-${post.id}`
            );
          }
        }
      } else if (
        conversation.product_id
      ) {
        /*
         * Backward compatibility for older
         * product conversations.
         */
        const {
          data: product,
          error: productError,
        } = await supabase
          .from("products")
          .select("name")
          .eq(
            "id",
            conversation.product_id
          )
          .maybeSingle();

        if (cancelled) return;

        if (productError) {
          console.error(
            "Failed to load product:",
            productError
          );

          setError(true);
          setLoading(false);
          return;
        }

        if (product) {
          setProductName(
            product.name
          );
          setListingUrl(
            `/products/${conversation.product_id}`
          );
        }
      }

      // Load messages.
      const {
        data: messageData,
        error: messageError,
      } = await supabase
        .from("messages")
        .select("*")
        .eq(
          "conversation_id",
          conversationId
        )
        .order("created_at");

      if (cancelled) return;

      if (messageError) {
        console.error(
          "Failed to load messages:",
          messageError
        );

        setError(true);
        setLoading(false);
        return;
      }

      setMessages(messageData || []);
      setLoading(false);
    }

    initializeChat();

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
          if (cancelled) return;

          setMessages((prev) => {
            const newMessage =
              payload.new as Message;

            const alreadyExists =
              prev.some(
                (message) =>
                  message.id ===
                  newMessage.id
              );

            if (alreadyExists) {
              return prev;
            }

            return [
              ...prev,
              newMessage,
            ];
          });
        }
      )
      .subscribe((status) => {
        if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT"
        ) {
          console.error(
            "Chat realtime connection failed:",
            status
          );
        }
      });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage() {
    const trimmedText =
      text.trim();

    if (
      !trimmedText ||
      !userId
    ) {
      return;
    }

    const { error } =
      await supabase
        .from("messages")
        .insert({
          conversation_id:
            conversationId,
          sender_id: userId,
          message: trimmedText,
        });

    if (error) {
      console.error(
        "Failed to send message:",
        error
      );

      toast.error(
        "Failed to send message. Please try again."
      );

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

  if (error) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-[rgb(17,27,33)] px-6 text-white">
        <div className="w-full max-w-md text-center">
          <CircleAlert
            size={36}
            className="mx-auto text-gray-400"
          />

          <h2 className="mt-4 text-lg font-semibold">
            Unable to load chat
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Something went wrong while loading this
            conversation. Please try again.
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-transparent px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-gray-800"
          >
            <RefreshCw size={17} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-w-0 flex-1 flex-col">
      <ChatHeader
        otherUser={otherUser}
        otherUserId={otherUserId}
        productName={productName}
        listingUrl={listingUrl}
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