"use client";

import Link from "next/link";
import Image from "next/image";
import { Package, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  sellerName?: string;
  category?: string;
  status?: string;
};

export default function ProductCard({
  id,
  name,
  price,
  image_url,
  sellerName,
  category,
  status,
}: ProductCardProps) {
  const router = useRouter();

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
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", id);

      if (error) {
        toast.error("Failed to remove from wishlist.");
        return;
      }

      setWishlisted(false);
      toast.success("Removed from wishlist.");
    } else {
      const { error } = await supabase
        .from("wishlist")
        .insert({
          user_id: user.id,
          product_id: id,
        });

      if (error) {
        toast.error("Failed to add to wishlist.");
        return;
      }

      setWishlisted(true);
      toast.success("Added to wishlist.");
    }
  }

  const statusStyles = {
    available: "bg-green-100 text-green-700",
    reserved: "bg-yellow-100 text-yellow-700",
    sold: "bg-red-100 text-red-700",
  };

  const detailsUrl = `/products/${id}`;

  return (
    <div
      onClick={() => router.push(detailsUrl)}
      className="flex h-full w-full cursor-pointer flex-col rounded-xl border bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative mb-4 flex h-48 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist();
          }}
          className="absolute right-3 top-3 rounded-full bg-white p-2 shadow transition hover:scale-105"
          aria-label={
            wishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
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
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="h-full w-full object-cover"
          />
        ) : (
          <Package
            size={60}
            className="text-gray-400"
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {name}
        </h2>

        <div className="flex items-center gap-2">
          {category && (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
              {category}
            </span>
          )}

          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              statusStyles[
                (status as keyof typeof statusStyles) ||
                  "available"
              ]
            }`}
          >
            {status?.toUpperCase() || "AVAILABLE"}
          </span>
        </div>
      </div>

      <p className="mt-2 text-2xl font-bold text-green-600">
        ₹{price}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        Seller: {sellerName}
      </p>

      <div className="mt-auto pt-5">
        <Link
          href={detailsUrl}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="w-full rounded-lg bg-blue-600 py-2 text-white transition hover:bg-blue-700">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}