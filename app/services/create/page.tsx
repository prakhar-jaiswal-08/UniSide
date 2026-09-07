"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/uploadImage";
import { toast } from "sonner";
import { Wrench, Upload } from "lucide-react";

export default function CreateServicePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Available");
  const [pricingType, setPricingType] = useState("Fixed");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<File | null>(null);

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
        image_url: imageUrl,
      });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Service posted successfully!");

    router.push("/services");
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12 font-sans">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
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

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-300 bg-white p-6 shadow-md sm:p-8"
        >
          <div className="space-y-6">

            {/* Service Title */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Service Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                placeholder="Math Tutor"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              >
                <option value="">Select Category</option>
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

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-36 w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                placeholder="Describe your service..."
              />
            </div>

            {/* Price + Pricing Type */}
            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Price
                </label>

                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Per Hour">Per Hour</option>
                  <option value="Per Day">Per Day</option>
                  <option value="Free">Free</option>
                </select>
              </div>

            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Completed">Unavailable</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Location
              </label>

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                placeholder="Online / Hostel A / Library"
              />
            </div>

            {/* Image */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Service Image
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-4 transition hover:bg-gray-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm">
                  <Upload size={19} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {image ? image.name : "Choose an image"}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    JPG, PNG or other image formats
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      setImage(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

          </div>

          {/* Submit */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <button
              type="submit"
              className="w-full rounded-lg bg-gray-900 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              Offer Service
            </button>
          </div>
        </form>

      </div>
    </main>
  );
}