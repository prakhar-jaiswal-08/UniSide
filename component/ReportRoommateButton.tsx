"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Props = {
  roommateId: string;
};

const reasons = [
  "Spam",
  "Fraud or scam",
  "Fake roommate listing",
  "Inappropriate content",
  "Misleading information",
  "Other",
];

export default function ReportRoommateButton({
  roommateId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!reason) {
      toast.error("Please select a reason.");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please login first.");
        return;
      }

      const { error } = await supabase
        .from("reports")
        .insert({
          roommate_id: roommateId,
          reporter_id: user.id,
          reason,
          description: description.trim() || null,
        });

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Report submitted successfully.");

      setReason("");
      setDescription("");
      setOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to submit report."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <Flag size={16} />
        Report Listing
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">
              Report Roommate Listing
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Tell us why you are reporting this listing.
            </p>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-white">
                Reason
              </label>

              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none focus:ring-2"
              >
                <option value="">Select a reason</option>

                {reasons.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-white">
                Additional Details
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Optional"
                className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none focus:ring-2"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={submitting}
                className="rounded-lg bg-zinc-700 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}