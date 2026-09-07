"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Props = {
  listingId: string;
  listingType: "product" | "service" | "roommate";
};

export default function WishlistButton({
  listingId,
  listingType,
}: Props) {
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWishlist();
  }, [listingId, listingType]);

  async function checkWishlist() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    let query = supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", user.id);

    if (listingType === "product") {
      query = query.eq("product_id", listingId);
    } else if (listingType === "service") {
      query = query.eq("service_id", listingId);
    } else {
      query = query.eq("roommate_id", listingId);
    }

    const { data } = await query.maybeSingle();

    setWishlisted(!!data);
  }

  async function toggleWishlist() {
    if (loading) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login first.");
      return;
    }

    setLoading(true);

    let query = supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", user.id);

    if (listingType === "product") {
      query = query.eq("product_id", listingId);
    } else if (listingType === "service") {
      query = query.eq("service_id", listingId);
    } else {
      query = query.eq("roommate_id", listingId);
    }

    const { data: existing } = await query.maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("id", existing.id);

      if (error) {
        toast.error("Failed to remove from wishlist.");
      } else {
        setWishlisted(false);
        toast.success("Removed from wishlist.");
      }
    } else {
      const payload: {
        user_id: string;
        product_id?: string;
        service_id?: string;
        roommate_id?: string;
      } = {
        user_id: user.id,
      };

      if (listingType === "product") {
        payload.product_id = listingId;
      } else if (listingType === "service") {
        payload.service_id = listingId;
      } else {
        payload.roommate_id = listingId;
      }

      const { error } = await supabase
        .from("wishlist")
        .insert(payload);

    if (error) {
  console.error("Wishlist insert error:", error);
  toast.error(error.message);

      } else {
        setWishlisted(true);
        toast.success("Added to wishlist.");
      }
    }

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      disabled={loading}
      aria-label={
        wishlisted
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      className="rounded-full bg-white p-3 shadow-md transition hover:scale-105 disabled:opacity-50"
    >
      <Heart
        size={24}
        className={
          wishlisted
            ? "fill-red-500 text-red-500"
            : "text-gray-500"
        }
      />
    </button>
  );
}