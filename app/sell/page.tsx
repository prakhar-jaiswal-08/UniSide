"use client";

import {
  prepareImageFile,
  uploadImage,
} from "@/lib/uploadImage";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function SellPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Others");
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);

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

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length === 0) {
      e.target.value = "";
      return;
    }

    setProcessingImages(true);

    try {
      const preparedFiles: File[] = [];

      for (const file of selectedFiles) {
        const preparedFile = await prepareImageFile(file);
        preparedFiles.push(preparedFile);
      }

      setImages((current) => {
        const combined = [...current, ...preparedFiles];

        const unique = combined.filter(
          (file, index, array) =>
            index ===
            array.findIndex(
              (item) =>
                item.name === file.name &&
                item.size === file.size &&
                item.lastModified === file.lastModified
            )
        );

        if (unique.length > 5) {
          toast.error(
            "You can upload a maximum of 5 photos."
          );

          return unique.slice(0, 5);
        }

        return unique;
      });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to process the selected image."
      );
    } finally {
      setProcessingImages(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("Please upload at least one photo.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login first.");
      return;
    }

    setUploading(true);

    try {
      const imageUrls: string[] = [];

      for (const image of images) {
        const url = await uploadImage(image);
        imageUrls.push(url);
      }

      const { data: product, error } = await supabase
        .from("products")
        .insert([
          {
            name,
            price: Number(price),
            description,
            category,
            user_id: user.id,
            image_url: imageUrls[0],
          },
        ])
        .select("id")
        .single();

      if (error || !product) {
        throw new Error(
          error?.message || "Failed to create product."
        );
      }

      if (imageUrls.length > 1) {
        const additionalImages = imageUrls
          .slice(1)
          .map((url, index) => ({
            product_id: product.id,
            image_url: url,
            display_order: index + 1,
          }));

        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(additionalImages);

        if (imagesError) {
          throw new Error(imagesError.message);
        }
      }

      toast.success("Product listed successfully!");

      setName("");
      setPrice("");
      setDescription("");
      setCategory("Others");
      setImages([]);

      router.push("/products");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to list product."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10 font-sans text-gray-900 lg:px-8">
      <div className="mx-auto max-w-3xl">

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

        <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-md sm:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

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
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div>
              <label
                htmlFor="product-image"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Product Images
              </label>

              <input
                id="product-image"
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                onChange={handleImageChange}
                disabled={processingImages || uploading}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-xs text-gray-500">
                {processingImages
                  ? "Processing selected images..."
                  : "Select up to 5 photos. HEIC and HEIF images are supported."}
              </p>

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {images.map((image, index) => (
                    <div
                      key={`${image.name}-${image.size}-${image.lastModified}`}
                      className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Selected product photo ${index + 1}`}
                        className="h-24 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={processingImages || uploading}
                        className="absolute right-1.5 top-1.5 rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Remove
                      </button>

                      {index === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-gray-700 shadow-sm">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  uploading || processingImages
                }
                className="w-full rounded-lg bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processingImages
                  ? "Processing Images..."
                  : uploading
                    ? "Uploading..."
                    : "List Product"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}