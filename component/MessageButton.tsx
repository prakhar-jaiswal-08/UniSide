"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Props = {
  sellerId: string;

  listingId?: string;
  listingType?:
    | "product"
    | "service"
    | "roommate"
    | "lost_found"
    | "feed";

  // Backward compatibility
  productId?: string;

  buttonText?: string;
};

export default function MessageButton({
  sellerId,
  listingId,
  listingType,
  productId,
  buttonText = "Message",
}: Props) {
  const router = useRouter();

  const finalListingId = listingId ?? productId;
  const finalListingType = listingType ?? "product";

  async function handleMessage() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login first.");
      router.push("/login");
      return;
    }

    if (user.id === sellerId) {
      toast.error("You cannot message yourself.");
      return;
    }

    /*
     * A conversation is now based on the two users,
     * not on the listing.
     *
     * This means:
     * Product -> Chat
     * Service -> Chat
     * Roommate -> Chat
     * Feed -> Chat
     *
     * will all open the same conversation between
     * the same two students.
     */

    const { data: existingConversations, error: findError } =
      await supabase
        .from("conversations")
        .select("id, buyer_id, seller_id")
        .or(
          `and(buyer_id.eq.${user.id},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true })
        .limit(1);

    if (findError) {
      toast.error(findError.message);
      return;
    }

    if (existingConversations && existingConversations.length > 0) {
      router.push(`/chat/${existingConversations[0].id}`);
      return;
    }

    /*
     * No conversation exists, so create the first one.
     *
     * We still keep the listing information for compatibility
     * with existing conversations and chat context.
     */
    const { data: newConversation, error: insertError } =
      await supabase
        .from("conversations")
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,

          listing_type: finalListingType,
          listing_id: finalListingId ?? null,

          product_id:
            finalListingType === "product" && finalListingId
              ? Number(finalListingId)
              : null,
        })
        .select("id")
        .single();

    if (insertError) {
      toast.error(insertError.message);
      return;
    }

    toast.success("Conversation started successfully!");

    router.push(`/chat/${newConversation.id}`);
  }

  return (
    <button
      onClick={handleMessage}
      className="mt-4 w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
    >
      {buttonText}
    </button>
  );
}