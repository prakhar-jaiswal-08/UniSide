"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  GraduationCap,
  Building2,
  Calendar,
  Phone,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function EditProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? "");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select(
          "name, age, college, department, year, mobile_number"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        toast.error("Failed to load profile.");
        setLoading(false);
        return;
      }

      setName(profile?.name ?? "");
      setAge(
        profile?.age !== null &&
        profile?.age !== undefined
          ? String(profile.age)
          : ""
      );
      setCollege(profile?.college ?? "");
      setDepartment(profile?.department ?? "");
      setYear(profile?.year ?? "");
      setMobileNumber(profile?.mobile_number ?? "");

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedCollege = college.trim();
    const trimmedDepartment = department.trim();
    const trimmedYear = year.trim();
    const trimmedMobile = mobileNumber.trim();

    if (!trimmedName) {
      toast.error("Name cannot be empty.");
      return;
    }

    if (age && (Number(age) < 1 || Number(age) > 100)) {
      toast.error("Please enter a valid age.");
      return;
    }

    if (trimmedMobile && !/^[0-9]{10}$/.test(trimmedMobile)) {
      toast.error("Mobile number must contain 10 digits.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          name: trimmedName,
          age: age ? Number(age) : null,
          college: trimmedCollege || null,
          department: trimmedDepartment || null,
          year: trimmedYear || null,
          mobile_number: trimmedMobile || null,
        })
        .eq("id", user.id);

      if (error) {
        console.error(error);
        toast.error("Failed to update profile.");
        return;
      }

      toast.success("Profile updated successfully.");

      router.push("/profile");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-10 font-sans">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-gray-500">
              Loading profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  const initial =
    name.trim().charAt(0).toUpperCase() || "U";

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10 font-sans text-gray-900 lg:px-8">
      <div className="mx-auto max-w-2xl">

        {/* Back */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-950"
        >
          <ArrowLeft size={17} />
          Back to Profile
        </Link>

        {/* Page Header */}
        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500">
            Account
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">
            Edit Profile
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Update your information shown on your marketplace profile.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSave}
          className="mt-7 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >

          {/* Profile Header */}
          <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-950 text-xl font-semibold uppercase text-white">
              {initial}
            </div>

            <div>
              <h2 className="font-semibold text-gray-950">
                Profile information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Basic information about you.
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="mt-6">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Name
            </label>

            <div className="relative">
              <User
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={50}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mt-5">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Email
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="h-11 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 pl-10 pr-4 text-sm text-gray-500 outline-none"
              />
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Your email address is private and cannot be changed here.
            </p>
          </div>

          {/* Age */}
          <div className="mt-5">
            <label
              htmlFor="age"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Age
            </label>

            <div className="relative">
              <Calendar
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="age"
                type="number"
                min="1"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Your age will be visible on your public profile.
            </p>
          </div>

          {/* College */}
          <div className="mt-5">
            <label
              htmlFor="college"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              College
            </label>

            <div className="relative">
              <GraduationCap
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="college"
                type="text"
                value={college}
                onChange={(e) =>
                  setCollege(e.target.value)
                }
                placeholder="Enter your college"
                maxLength={100}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Your college will be visible on your public profile.
            </p>
          </div>

          {/* Department */}
          <div className="mt-5">
            <label
              htmlFor="department"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Department
            </label>

            <div className="relative">
              <Building2
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="department"
                type="text"
                value={department}
                onChange={(e) =>
                  setDepartment(e.target.value)
                }
                placeholder="e.g. Computer Science & Engineering"
                maxLength={100}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Your department will be visible on your public profile.
            </p>
          </div>

          {/* Year */}
          <div className="mt-5">
            <label
              htmlFor="year"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Year
            </label>

            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            >
              <option value="">
                Select your year
              </option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="5th Year">5th Year</option>
              <option value="Postgraduate">
                Postgraduate
              </option>
              <option value="Other">Other</option>
            </select>

            <p className="mt-2 text-xs text-gray-400">
              Your year will be visible on your public profile.
            </p>
          </div>

          {/* Mobile Number */}
          <div className="mt-5">
            <label
              htmlFor="mobile"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Mobile Number
            </label>

            <div className="relative">
              <Phone
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                value={mobileNumber}
                onChange={(e) =>
                  setMobileNumber(
                    e.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Your mobile number is private and will not appear on your public profile.
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-800">
              Privacy
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Name, age, college, department, and year can be viewed by other marketplace users. Your email address and mobile number remain private.
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/profile"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gray-950 px-5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}