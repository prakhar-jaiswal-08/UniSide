"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/component/ProductCard";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  profiles: {
    name: string;
  } | null;
};

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Step 1: Get wishlist product IDs
    const { data: wishlist, error: wishlistError } = await supabase
      .from("wishlist")
      .select("product_id")
      .eq("user_id", user.id);

    if (wishlistError) {
      console.error(wishlistError);
      setLoading(false);
      return;
    }

    if (!wishlist || wishlist.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const productIds = wishlist.map((item) => item.product_id);

    // Step 2: Fetch those products
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        profiles (
          name
        )
      `)
      .in("id", productIds);

    if (error) {
      console.error(error);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-8 py-8">
        <h1 className="text-2xl text-white">Loading...</h1>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-8 py-8">
      <h1 className="text-4xl font-bold text-white mb-2">
        ❤️ My Wishlist
      </h1>

      <p className="text-gray-400 mb-8">
        Products you've saved for later.
      </p>

      {products.length === 0 ? (
        <div className="text-center mt-20">
          <h2 className="text-2xl text-white font-semibold">
            Your wishlist is empty
          </h2>

          <p className="text-gray-400 mt-2">
            Start exploring products and save your favorites.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image_url={product.image_url}
              category={product.category}
              sellerName={product.profiles?.name}
            />
          ))}
        </div>
      )}
    </main>
  );
}