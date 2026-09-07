"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import BackButton from "@/component/navigation/BackButton";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [saving, setSaving] = useState(false);

  async function handleChangePassword(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
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

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error(error);
        toast.error(error.message);
        return;
      }

      toast.success("Password updated successfully.");

      setNewPassword("");
      setConfirmPassword("");

      router.push("/profile");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10 font-sans text-gray-900 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <BackButton
          fallback="/profile"
          label="Back to Profile"
        />

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500">
            Account
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">
            Change Password
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Update the password you use to sign in to Uniside.
          </p>
        </div>

        <form
          onSubmit={handleChangePassword}
          className="mt-7 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-950 text-white">
              <KeyRound size={24} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-950">
                Password security
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose a strong password that you do not use elsewhere.
              </p>
            </div>
          </div>

          {/* New Password */}
          <div className="mt-6">
            <label
              htmlFor="newPassword"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              New Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="Enter new password"
                minLength={6}
                autoComplete="new-password"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />

              <button
                type="button"
                onClick={() =>
                  setShowNewPassword((value) => !value)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                aria-label={
                  showNewPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showNewPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Password must be at least 6 characters.
            </p>
          </div>

          {/* Confirm Password */}
          <div className="mt-5">
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Confirm New Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Re-enter new password"
                minLength={6}
                autoComplete="new-password"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (value) => !value
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-800">
              Security
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Your password is managed securely by Supabase
              Authentication and is never stored in your profile.
            </p>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gray-950 px-5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Lock size={17} />
              {saving
                ? "Updating..."
                : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}