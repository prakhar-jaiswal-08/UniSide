"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { categories } from "@/lib/categories";
import { toast } from "sonner";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Others");

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Product not found");
        router.push("/profile");
        return;
      }

      setName(data.name);
      setPrice(data.price.toString());
      setDescription(data.description ?? "");
      setCategory(data.category ?? "Others");
    }

    loadProduct();
  }, [id, router]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase
      .from("products")
      .update({
        name,
        price: Number(price),
        description,
        category,
      })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Product updated successfully!");
    router.push("/profile");
  }

  return (
    <main className="min-h-screen flex justify-center items-center bg-black px-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-white">
          Edit Product
        </h1>

        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block font-medium text-white mb-2">
              Product Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-white mb-2">
              Price
            </label>

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-white mb-2">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-white mb-2">
              Description
            </label>

            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white"
            />
          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
          >
            Update Product
          </button>
        </form>
      </div>
    </main>
  );
}