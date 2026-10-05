"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { uploadServiceImage } from "@/lib/uploadServiceImage";
import { toast } from "sonner";
import { Wrench, Upload, X } from "lucide-react";

export default function CreateServicePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Available");
  const [pricingType, setPricingType] = useState("Fixed");
  const [location, setLocation] = useState("");

  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length === 0) {
      e.target.value = "";
      return;
    }

    setImages((current) => {
      const combined = [...current, ...selectedFiles];

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

    e.target.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    setImages((current) =>
      current.filter(
        (_, index) => index !== indexToRemove
      )
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login first.");
      router.push("/login");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a service title.");
      return;
    }

    if (!category) {
      toast.error("Please select a category.");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description.");
      return;
    }

    if (images.length > 5) {
      toast.error(
        "You can upload a maximum of 5 photos."
      );
      return;
    }

    setUploading(true);

    try {
      const imageUrls: string[] = [];

      for (const image of images) {
        const url = await uploadServiceImage(
          image,
          user.id
        );

        imageUrls.push(url);
      }

      const { data: service, error } =
        await supabase
          .from("services")
          .insert({
            user_id: user.id,
            title,
            description,
            category,
            price: price ? Number(price) : null,
            pricing_type: pricingType,
            status,
            location,
            image_url: imageUrls[0] || "",
          })
          .select("id")
          .single();

      if (error || !service) {
        toast.error(
          error?.message ||
            "Failed to create service."
        );
        return;
      }

      if (imageUrls.length > 1) {
        const additionalImages = imageUrls
          .slice(1)
          .map((imageUrl, index) => ({
            service_id: service.id,
            image_url: imageUrl,
            display_order: index + 1,
          }));

        const { error: imagesError } =
          await supabase
            .from("service_images")
            .insert(additionalImages);

        if (imagesError) {
          toast.error(
            "Service was created, but additional images could not be saved."
          );
          return;
        }
      }

      toast.success(
        "Service posted successfully!"
      );

      router.push("/services");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong while uploading."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12 font-sans">
      <div className="mx-auto max-w-3xl">

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white">
              <Wrench size={22} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-950">
                Offer a Service
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Share your skills with students in your college.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-300 bg-white p-6 shadow-md sm:p-8"
        >
          <div className="space-y-6">

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Service Title
              </label>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                placeholder="Math Tutor"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition"
              >
                <option value="">
                  Select Category
                </option>
                <option>Tutoring</option>
                <option>Programming</option>
                <option>Graphic Design</option>
                <option>Photography</option>
                <option>Video Editing</option>
                <option>Assignment Help</option>
                <option>Notes & Printing</option>
                <option>Repair & Maintenance</option>
                <option>Fitness</option>
                <option>Music</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                className="h-36 w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                placeholder="Describe your service..."
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Price
                </label>

                <input
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  type="number"
                  min="0"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  placeholder="300"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Pricing Type
                </label>

                <select
                  value={pricingType}
                  onChange={(e) =>
                    setPricingType(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition"
                >
                  <option value="Fixed">
                    Fixed
                  </option>
                  <option value="Per Hour">
                    Per Hour
                  </option>
                  <option value="Per Day">
                    Per Day
                  </option>
                  <option value="Free">
                    Free
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition"
              >
                <option value="Available">
                  Available
                </option>
                <option value="Reserved">
                  Reserved
                </option>
                <option value="Completed">
                  Unavailable
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Location
              </label>

              <input
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                placeholder="Online / Hostel A / Library"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Service Images
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-4 transition hover:bg-gray-100">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm">
                  <Upload size={19} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {images.length > 0
                      ? `${images.length} photo${
                          images.length > 1
                            ? "s"
                            : ""
                        } selected`
                      : "Choose service photos"}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    JPG, PNG, HEIC or other image formats · Max 5 photos
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  multiple
                  disabled={uploading}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {images.map((image, index) => (
                    <div
                      key={`${image.name}-${image.size}-${image.lastModified}`}
                      className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <div className="aspect-square">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Service photo ${
                            index + 1
                          }`}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {index === 0 && (
                        <div className="absolute left-2 top-2 rounded-md bg-gray-900 px-2 py-1 text-[10px] font-semibold text-white">
                          Main
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(index)
                        }
                        disabled={uploading}
                        aria-label={`Remove photo ${
                          index + 1
                        }`}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-gray-800 shadow-md transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <button
              type="submit"
              disabled={uploading}
              className="w-full rounded-lg bg-gray-900 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading
                ? "Uploading..."
                : "Offer Service"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}