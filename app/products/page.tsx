"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/component/ProductCard";
import { supabase } from "@/lib/supabase";
import { categories } from "@/lib/categories";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    name: string;
  } | null;
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          profiles (
            name
          )
        `
        );

      if (error) {
        console.error(error);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    }

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const query = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        (product.description ?? "").toLowerCase().includes(query) ||
        (product.profiles?.name ?? "").toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case "low-high":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;

      case "high-low":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;

      default:
        filtered = [...filtered].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
    }

    return filtered;
  }, [products, search, sortBy, selectedCategory]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-8 py-8">
        <h1 className="text-2xl text-white">Loading...</h1>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-8 py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Browse Products
          </h1>

          <p className="text-gray-400 mt-2">
            Buy and sell items within your college.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Category
            </label>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="All">All</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Sort By
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="newest">Newest</option>
              <option value="low-high">Price: Low → High</option>
              <option value="high-low">Price: High → Low</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-gray-400 text-lg">
          No products found.
        </p>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image_url={product.image_url}
              sellerName={product.profiles?.name}
              category={product.category}
            />
          ))}
        </div>
      )}
    </main>
  );
}