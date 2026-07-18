
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/uploadImage";
import { toast } from "sonner";

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();

  const id = Number(params.id);

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [pricingType, setPricingType] = useState("Fixed");
  const [status, setStatus] = useState("Available");
  const [location, setLocation] = useState("");

  const [currentImage, setCurrentImage] = useState("");
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    loadService();
  }, []);

  async function loadService() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login first.");
      router.push("/login");
      return;
    }

    const { data: service, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !service) {
      toast.error("Service not found.");
      router.push("/services");
      return;
    }

    if (service.user_id !== user.id) {
      toast.error("You cannot edit this service.");
      router.push("/services");
      return;
    }

    setTitle(service.title);
    setCategory(service.category);
    setDescription(service.description);
    setPrice(service.price ? service.price.toString() : "");
    setPricingType(service.pricing_type);
    setStatus(service.status ?? "Available");
    setLocation(service.location ?? "");
    setCurrentImage(service.image_url ?? "");

    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login first.");
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

    let imageUrl = currentImage;

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
      .update({
  title,
  description,
  category,
  price: price ? Number(price) : null,
  pricing_type: pricingType,
  status,
  location,
  image_url: imageUrl,
})
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Service updated successfully!");

    router.push("/services");
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-center text-gray-500">
          Loading service...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-4xl font-bold">
        Edit Service
      </h1>

      <p className="mt-2 text-gray-500">
        Update your service details.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-10 space-y-6"
      >       <div>
          <label className="mb-2 block font-medium">
            Service Title
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border p-3"
            placeholder="Math Tutor"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border p-3"
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

        <div>
          <label className="mb-2 block font-medium">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-36 w-full rounded-xl border p-3"
            placeholder="Describe your service..."
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Price
            </label>

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border p-3"
              placeholder="300"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Pricing Type
            </label>

            <select
              value={pricingType}
              onChange={(e) =>
                setPricingType(e.target.value)
              }
              className="w-full rounded-xl border p-3"
            >
              <option value="Fixed">Fixed</option>
              <option value="Per Hour">Per Hour</option>
              <option value="Per Day">Per Day</option>
              <option value="Free">Free</option>
            </select>
          </div>
          <div>
  <label className="mb-2 block font-medium">
    Status
  </label>

  <select
    value={status}
    onChange={(e) => setStatus(e.target.value)}
    className="w-full rounded-xl border p-3"
  >
    <option value="Available">🟢 Available</option>
    <option value="Reserved">🟡 Reserved</option>
    <option value="Completed">🔴 Unavailable</option>
  </select>
</div>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Location
          </label>

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border p-3"
            placeholder="Online / Hostel A / Library"
          />
        </div>

        {currentImage && (
          <div>
            <label className="mb-2 block font-medium">
              Current Image
            </label>

            <div className="overflow-hidden rounded-xl border">
              <Image
                src={currentImage}
                alt={title}
                width={800}
                height={400}
                className="h-64 w-full object-cover"
              />
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 block font-medium">
            Replace Image (Optional)
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.length) {
                setImage(e.target.files[0]);
              }
            }}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}