"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home, Users, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";

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

  const [image, setImage] = useState<File | null>(null);
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
    const file = e.target.files?.[0] || null;

    if (!file) {
      setImage(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      setImage(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      setImage(null);
      return;
    }

    setError("");
    setImage(file);
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

      // Create the roommate listing first.
      const { data: roommate, error: insertError } = await supabase
        .from("roommates")
        .insert({
          user_id: user.id,
          name: form.name.trim(),
          college: form.college.trim(),
          location: form.location.trim(),
          budget: Number(form.budget),
          room_type: form.room_type,
          gender_preference: form.gender_preference || null,
          preferences: form.preferences.trim() || null,
          move_in_date: form.move_in_date || null,
          description: form.description.trim() || null,
          contact_preference: form.contact_preference || null,
          status: "available",
        })
        .select("id")
        .single();

      if (insertError || !roommate) {
        throw new Error(
          insertError?.message || "Unable to create listing."
        );
      }

      // Upload image if one was selected.
      if (image) {
        const fileExtension =
          image.name.split(".").pop()?.toLowerCase() || "jpg";

        const filePath = `${user.id}/${roommate.id}-${Date.now()}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("roommate-images")
          .upload(filePath, image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            `Listing created, but image upload failed: ${uploadError.message}`
          );
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("roommate-images")
          .getPublicUrl(filePath);

        const { error: imageUpdateError } = await supabase
          .from("roommates")
          .update({
            image_url: publicUrl,
          })
          .eq("id", roommate.id)
          .eq("user_id", user.id);

        if (imageUpdateError) {
          throw new Error(
            `Listing created, but image could not be saved: ${imageUpdateError.message}`
          );
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
              <h2 className="font-semibold">Basic Information</h2>
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
              <h2 className="font-semibold">Room Requirements</h2>
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
                  <option value="">Select room type</option>
                  <option value="Single">Single Room</option>
                  <option value="Shared">Shared Room</option>
                  <option value="1BHK">1 BHK</option>
                  <option value="2BHK">2 BHK</option>
                  <option value="PG">PG</option>
                  <option value="Other">Other</option>
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
                  <option value="">No preference</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Any">Any</option>
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
                  <option value="">Select preference</option>
                  <option value="Chat">Chat on Marketplace</option>
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                </select>
              </div>
            </div>
          </section>

          {/* Image */}
          <section className="rounded-xl border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Upload size={18} />
              <h2 className="font-semibold">Listing Image</h2>
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
                {image ? image.name : "Choose an image"}
              </span>

              <span className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, WEBP up to 5 MB
              </span>

              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {image && (
              <p className="mt-3 text-xs text-muted-foreground">
                Selected image: {image.name}
              </p>
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
              {loading ? "Creating..." : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}