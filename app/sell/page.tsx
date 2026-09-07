"use client";

import { uploadImage } from "@/lib/uploadImage";
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
      try {
        imageUrl = await uploadImage(image);
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Image upload failed."
        );
        return;
      }
    }

    const { error } = await supabase
      .from("products")
      .insert([
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
      toast.error("Failed to list product.");
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
    <main className="min-h-screen bg-gray-100 px-6 py-10 font-sans text-gray-900 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}

        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
            Marketplace
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-950">
            Sell an Item
          </h1>

          <p className="mt-2 text-gray-500">
            List your product for students in your college.
          </p>
        </div>

        {/* Form Card */}

        <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-md sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Product Name */}

            <div>
              <label
                htmlFor="product-name"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Product Name
              </label>

              <input
                id="product-name"
                type="text"
                placeholder="e.g. iPhone 13"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            {/* Price */}

            <div>
              <label
                htmlFor="price"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Price (₹)
              </label>

              <input
                id="price"
                type="number"
                min="0"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            {/* Category */}

            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Category
              </label>

              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              >
                <option>Electronics</option>
                <option>Books</option>
                <option>Notes</option>
                <option>Furniture</option>
                <option>Sports</option>
                <option>Others</option>
              </select>
            </div>

            {/* Description */}

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Description
              </label>

              <textarea
                id="description"
                rows={5}
                placeholder="Describe your product..."
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                required
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            {/* Product Image */}

            <div>
              <label
                htmlFor="product-image"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Product Image
              </label>

              <input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (
                    e.target.files &&
                    e.target.files.length > 0
                  ) {
                    setImage(e.target.files[0]);
                  }
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
              />

              {image && (
                <p className="mt-2 text-xs text-gray-500">
                  Selected: {image.name}
                </p>
              )}
            </div>

            {/* Submit */}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-lg bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                List Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}