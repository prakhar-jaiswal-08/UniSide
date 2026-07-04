"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Props = {
  productId: string;
  sellerId: string;
};

export default function MessageSellerButton({
  productId,
  sellerId,
}: Props) {
  const router = useRouter();

  async function handleMessageSeller() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login first.");
      router.push("/login");
      return;
    }

    // Prevent messaging yourself
    if (user.id === sellerId) {
      toast.error("You cannot message yourself.");
      return;
    }

    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("buyer_id", user.id)
      .eq("seller_id", sellerId)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingConversation) {
      router.push(`/chat/${existingConversation.id}`);
      return;
    }

    // Create a new conversation
    const { data: newConversation, error } = await supabase
      .from("conversations")
      .insert({
        buyer_id: user.id,
        seller_id: sellerId,
        product_id: productId,
      })
      .select("id")
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Conversation started successfully!");
    router.push(`/chat/${newConversation.id}`);
  }

  return (
    <button
      onClick={handleMessageSeller}
      className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
    >
       Message Seller
    </button>
  );
}
