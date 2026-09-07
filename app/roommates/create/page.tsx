"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Home,
  Users,
  Upload,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/uploadImage";

export default function CreateRoommatePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    college: "",
    location: "",
    budget: "",
    room_type: "",
    gender_preference: "",
    preferences: "",
    move_in_date: "",
    description: "",
    contact_preference: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    const validFiles = selectedFiles.filter((file) => {
      const fileExtension =
        file.name.split(".").pop()?.toLowerCase();

      const isImage =
        file.type.startsWith("image/") ||
        fileExtension === "heic" ||
        fileExtension === "heif";

      if (!isImage) {
        setError(
          "Please select valid image files."
        );
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(
          `${file.name} is larger than 5 MB.`
        );
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    setImages((current) => {
      const combined = [...current, ...validFiles];

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
        setError("You can upload a maximum of 5 photos.");
        return unique.slice(0, 5);
      }

      setError("");
      return unique;
    });

    e.target.value = "";
  }

  function removeImage(indexToRemove: number) {
    setImages((current) =>
      current.filter((_, index) => index !== indexToRemove)
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      if (!form.name.trim()) {
        throw new Error("Please enter your name.");
      }

      if (!form.college.trim()) {
        throw new Error("Please enter your college.");
      }

      if (!form.location.trim()) {
        throw new Error("Please enter your location.");
      }

      if (!form.budget || Number(form.budget) < 0) {
        throw new Error("Please enter a valid budget.");
      }

      if (!form.room_type) {
        throw new Error("Please select a room type.");
      }

      if (images.length > 5) {
        throw new Error(
          "You can upload a maximum of 5 photos."
        );
      }

      // Create the roommate listing first.
      const { data: roommate, error: insertError } =
        await supabase
          .from("roommates")
          .insert({
            user_id: user.id,
            name: form.name.trim(),
            college: form.college.trim(),
            location: form.location.trim(),
            budget: Number(form.budget),
            room_type: form.room_type,
            gender_preference:
              form.gender_preference || null,
            preferences:
              form.preferences.trim() || null,
            move_in_date:
              form.move_in_date || null,
            description:
              form.description.trim() || null,
            contact_preference:
              form.contact_preference || null,
            status: "available",
          })
          .select("id")
          .single();

      if (insertError || !roommate) {
        throw new Error(
          insertError?.message ||
            "Unable to create listing."
        );
      }

      // Upload selected images.
      if (images.length > 0) {
        const imageUrls: string[] = [];

        for (const image of images) {
          const url = await uploadImage(
            image,
            "roommate-images"
          );

          imageUrls.push(url);
        }

        // Save the first image as the main image.
        const { error: imageUpdateError } =
          await supabase
            .from("roommates")
            .update({
              image_url: imageUrls[0],
            })
            .eq("id", roommate.id)
            .eq("user_id", user.id);

        if (imageUpdateError) {
          throw new Error(
            `Listing created, but image could not be saved: ${imageUpdateError.message}`
          );
        }

        // Save remaining images in roommate_images.
        if (imageUrls.length > 1) {
          const additionalImages = imageUrls
            .slice(1)
            .map((imageUrl, index) => ({
              roommate_id: roommate.id,
              image_url: imageUrl,
              display_order: index + 1,
            }));

          const { error: additionalImagesError } =
            await supabase
              .from("roommate_images")
              .insert(additionalImages);

          if (additionalImagesError) {
            throw new Error(
              `Listing created, but additional images could not be saved: ${additionalImagesError.message}`
            );
          }
        }
      }

      router.push(`/roommates/${roommate.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/roommates"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Roommates
        </Link>

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border bg-muted">
              <Users size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Create Roommate Listing
              </h1>

              <p className="text-sm text-muted-foreground">
                Tell other students what kind of roommate arrangement you
                are looking for.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <section className="rounded-xl border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Users size={18} />
              <h2 className="font-semibold">
                Basic Information
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="college"
                  className="mb-2 block text-sm font-medium"
                >
                  College
                </label>

                <input
                  id="college"
                  name="college"
                  value={form.college}
                  onChange={handleChange}
                  placeholder="Your college or university"
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-medium"
                >
                  Preferred Location
                </label>

                <input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City, area or locality"
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="budget"
                  className="mb-2 block text-sm font-medium"
                >
                  Monthly Budget
                </label>

                <input
                  id="budget"
                  name="budget"
                  type="number"
                  min="0"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="Maximum monthly budget"
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2"
                  required
                />
              </div>
            </div>
          </section>

          {/* Room Requirements */}
          <section className="rounded-xl border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Home size={18} />
              <h2 className="font-semibold">
                Room Requirements
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="room_type"
                  className="mb-2 block text-sm font-medium"
                >
                  Room Type
                </label>

                <select
                  id="room_type"
                  name="room_type"
                  value={form.room_type}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2"
                  required
                >
                  <option value="">
                    Select room type
                  </option>
                  <option value="Single">
                    Single Room
                  </option>
                  <option value="Shared">
                    Shared Room
                  </option>
                  <option value="1BHK">
                    1 BHK
                  </option>
                  <option value="2BHK">
                    2 BHK
                  </option>
                  <option value="PG">
                    PG
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="gender_preference"
                  className="mb-2 block text-sm font-medium"
                >
                  Gender Preference
                </label>

                <select
                  id="gender_preference"
                  name="gender_preference"
                  value={form.gender_preference}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2"
                >
                  <option value="">
                    No preference
                  </option>
                  <option value="Male">
                    Male
                  </option>
                  <option value="Female">
                    Female
                  </option>
                  <option value="Any">
                    Any
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="move_in_date"
                  className="mb-2 block text-sm font-medium"
                >
                  Move-in Date
                </label>

                <input
                  id="move_in_date"
                  name="move_in_date"
                  type="date"
                  value={form.move_in_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="contact_preference"
                  className="mb-2 block text-sm font-medium"
                >
                  Contact Preference
                </label>

                <select
                  id="contact_preference"
                  name="contact_preference"
                  value={form.contact_preference}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2"
                >
                  <option value="">
                    Select preference
                  </option>
                  <option value="Chat">
                    Chat on Marketplace
                  </option>
                  <option value="Phone">
                    Phone
                  </option>
                  <option value="Email">
                    Email
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="rounded-xl border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Upload size={18} />
              <h2 className="font-semibold">
                Listing Images
              </h2>
            </div>

            <label
              htmlFor="image"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center hover:bg-muted"
            >
              <Upload
                size={28}
                className="mb-3 text-muted-foreground"
              />

              <span className="text-sm font-medium">
                {images.length > 0
                  ? `${images.length} photo${
                      images.length > 1 ? "s" : ""
                    } selected`
                  : "Choose listing photos"}
              </span>

              <span className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, WEBP, HEIC up to 5 MB each · Max 5 photos
              </span>

              <input
                id="image"
                name="image"
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* Previews */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {images.map((image, index) => (
                  <div
                    key={`${image.name}-${image.size}-${image.lastModified}`}
                    className="relative overflow-hidden rounded-lg border bg-muted"
                  >
                    <div className="aspect-square">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Roommate listing photo ${
                          index + 1
                        }`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {index === 0 && (
                      <div className="absolute left-2 top-2 rounded-md bg-black/75 px-2 py-1 text-[10px] font-semibold text-white">
                        Main
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label={`Remove photo ${
                        index + 1
                      }`}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-gray-800 shadow-md transition hover:bg-white"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Preferences */}
          <section className="rounded-xl border bg-card p-6">
            <h2 className="mb-5 font-semibold">
              Preferences & Description
            </h2>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="preferences"
                  className="mb-2 block text-sm font-medium"
                >
                  Roommate Preferences
                </label>

                <textarea
                  id="preferences"
                  name="preferences"
                  value={form.preferences}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Example: Non-smoker, vegetarian, quiet environment..."
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell potential roommates more about yourself and what you are looking for."
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2"
                />
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link
              href="/roommates"
              className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}