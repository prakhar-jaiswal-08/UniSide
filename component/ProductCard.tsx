"use client";

import Link from "next/link";
import Image from "next/image";
import { Package, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  sellerName?: string;
  category?: string;
};

export default function ProductCard({
  id,
  name,
  price,
  image_url,
  sellerName,
  category,
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    checkWishlist();
  }, []);

  async function checkWishlist() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", id)
      .maybeSingle();

    setWishlisted(!!data);
  }

  async function toggleWishlist() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login first.");
      return;
    }

    if (wishlisted) {
      await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", id);

      setWishlisted(false);
    } else {
      await supabase.from("wishlist").insert({
        user_id: user.id,
        product_id: id,
      });

      setWishlisted(true);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border w-80">
      <div className="relative h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow"
        >
          <Heart
            size={22}
            className={
              wishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-500"
            }
          />
        </button>

        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            width={400}
            height={300}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package size={60} className="text-gray-400" />
        )}
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {name}
        </h2>

        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
          {category}
        </span>
      </div>

      <p className="text-2xl font-bold text-green-600 mt-2">
        ₹{price}
      </p>

      <p className="text-sm text-gray-500 mt-2">
        Seller: {sellerName}
      </p>

      <Link href={`/products/${id}`}>
        <button className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
          View Details
        </button>
      </Link>
    </div>
  );
}