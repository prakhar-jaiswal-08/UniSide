"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Props = {
  sellerId: string;

  // Generic listing support
  listingId?: string;
  listingType?: "product" | "service" | "roommate" | "lost_found";

  // Temporary backward compatibility
  productId?: string;

  // Custom button text
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

    if (!finalListingId) {
      toast.error("Listing not found.");
      return;
    }

    // Check if conversation already exists
    const { data: existingConversation, error: findError } =
      await supabase
        .from("conversations")
        .select("id")
        .eq("buyer_id", user.id)
        .eq("seller_id", sellerId)
        .eq("listing_type", finalListingType)
        .eq("listing_id", Number(finalListingId))
        .maybeSingle();

    if (findError) {
      toast.error(findError.message);
      return;
    }

    if (existingConversation) {
      router.push(`/chat/${existingConversation.id}`);
      return;
    }

    // Create new conversation
    const { data: newConversation, error: insertError } =
      await supabase
        .from("conversations")
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,

          listing_type: finalListingType,
          listing_id: Number(finalListingId),

          // Keep old product chats working during migration
          product_id:
            finalListingType === "product"
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