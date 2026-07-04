"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function SellPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Others");
  const [image, setImage] = useState<File | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      }
    }

    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login first.");
      return;
    }

    let imageUrl = "";

    if (image) {
      const fileName = `${Date.now()}-${image.name}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, image);

      if (uploadError) {
       toast.error(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("products").insert([
      {
        name,
        price: Number(price),
        description,
        category,
        user_id: user.id,
        image_url: imageUrl,
      },
    ]);

    if (error) {
      toast.error("Please login first.");
      return;
    }

    toast.success("Product listed successfully!");

    setName("");
    setPrice("");
    setDescription("");
    setCategory("Others");
    setImage(null);

    router.push("/products");
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl shadow-xl p-8 border border-zinc-800">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Sell an Item
        </h1>

        <p className="text-center text-gray-400 mb-8">
          List your product for students in your college.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 font-medium text-white">
              Product Name
            </label>

            <input
              type="text"
              placeholder="e.g. iPhone 13"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-white">
              Price (₹)
            </label>

            <input
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-white">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Electronics</option>
              <option>Books</option>
              <option>Notes</option>
              <option>Furniture</option>
              <option>Sports</option>
              <option>Others</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-white">
              Description
            </label>

            <textarea
              rows={5}
              placeholder="Describe your product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-white">
              Product Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setImage(e.target.files[0]);
                }
              }}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            List Product
          </button>
        </form>
      </div>
    </main>
  );
}