"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Props = {
  profileId: string;
};

export default function ProfileMessageButton({
  profileId,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMessage() {
    if (loading) return;

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please login first.");
        router.push("/login");
        return;
      }

      if (user.id === profileId) {
        toast.error("You cannot message yourself.");
        return;
      }

      /*
       * Conversations are shared between two users.
       *
       * We intentionally do NOT filter by listing_type or listing_id.
       *
       * This means a conversation started from:
       * - Profile
       * - Product
       * - Service
       * - Roommate
       * - Feed
       *
       * will all use the same chat between these two users.
       */

      const { data: existingConversations, error: existingError } =
        await supabase
          .from("conversations")
          .select("id, buyer_id, seller_id")
          .or(
            `and(buyer_id.eq.${user.id},seller_id.eq.${profileId}),and(buyer_id.eq.${profileId},seller_id.eq.${user.id})`
          )
          .order("created_at", { ascending: true })
          .limit(1);

      if (existingError) {
        console.error(
          "Failed to find existing conversation:",
          existingError
        );

        toast.error("Failed to open chat.");
        return;
      }

      if (
        existingConversations &&
        existingConversations.length > 0
      ) {
        router.push(
          `/chat/${existingConversations[0].id}`
        );
        return;
      }

      /*
       * No conversation exists between these users.
       * Create the first one.
       *
       * "profile" is kept as the initial context so
       * ChatPanel can display "Direct conversation".
       */
      const { data: newConversation, error: createError } =
        await supabase
          .from("conversations")
          .insert({
            buyer_id: user.id,
            seller_id: profileId,
            listing_type: "profile",
            listing_id: profileId,
            product_id: null,
          })
          .select("id")
          .single();

      if (createError || !newConversation) {
        console.error(
          "Failed to create conversation:",
          createError
        );

        toast.error("Failed to start chat.");
        return;
      }

      router.push(
        `/chat/${newConversation.id}`
      );
    } catch (error) {
      console.error(
        "Profile message error:",
        error
      );

      toast.error("Failed to start chat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleMessage}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <MessageCircle size={17} />

      {loading ? "Opening..." : "Message"}
    </button>
  );
}