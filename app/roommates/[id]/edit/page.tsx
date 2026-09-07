"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function EditRoommatePage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

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
    status: "available",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadListing() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const { data: roommate, error: fetchError } = await supabase
          .from("roommates")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError || !roommate) {
          throw new Error("Roommate listing not found.");
        }

        if (roommate.user_id !== user.id) {
          router.push(`/roommates/${id}`);
          return;
        }

        setForm({
          name: roommate.name || "",
          college: roommate.college || "",
          location: roommate.location || "",
          budget:
            roommate.budget !== null
              ? String(roommate.budget)
              : "",
          room_type: roommate.room_type || "",
          gender_preference: roommate.gender_preference || "",
          preferences: roommate.preferences || "",
          move_in_date: roommate.move_in_date || "",
          description: roommate.description || "",
          contact_preference: roommate.contact_preference || "",
          status: roommate.status || "available",
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load listing."
        );
      } finally {
        setLoading(false);
      }
    }

    loadListing();
  }, [id, router]);

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSaving(true);

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

      const { error: updateError } = await supabase
        .from("roommates")
        .update({
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
          status: form.status,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      router.push(`/roommates/${id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Loading listing...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>

          <Link
            href={`/roommates/${id}`}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Listing
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={`/roommates/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Listing
        </Link>

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border bg-muted">
              <Users size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Edit Roommate Listing
              </h1>

              <p className="text-sm text-muted-foreground">
                Update your roommate requirements and listing details.
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
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2"
                />
              </div>
            </div>
          </section>

          {/* Status */}
          <section className="rounded-xl border bg-card p-6">
            <h2 className="mb-2 font-semibold">
              Listing Status
            </h2>

            <p className="mb-4 text-sm text-muted-foreground">
              Change the status when you no longer need a roommate.
            </p>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 sm:max-w-xs"
            >
              <option value="available">
                Available
              </option>
              <option value="unavailable">
                Unavailable
              </option>
              <option value="filled">
                Filled
              </option>
            </select>
          </section>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link
              href={`/roommates/${id}`}
              className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}