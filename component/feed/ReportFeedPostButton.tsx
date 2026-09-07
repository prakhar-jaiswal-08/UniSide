"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import ConfirmDialog from "@/component/ui/ConfirmDialog";

type Props = {
  postId: number;
};

const reasons = [
  "Spam",
  "Fraud or scam",
  "Inappropriate content",
  "Harassment",
  "Misleading information",
  "Other",
];

export default function ReportFeedPostButton({
  postId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReport() {
    if (!reason) {
      toast.error("Please select a reason.");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please login to report a post.");
        return;
      }

      const { error } = await supabase
        .from("reports")
        .insert({
          feed_post_id: postId,
          reporter_id: user.id,
          reason,
          description: description.trim() || null,
          status: "pending",
        });

      if (error) {
        console.error("Failed to report feed post:", error);
        toast.error("Failed to submit report.");
        return;
      }

      toast.success("Report submitted.");
      setOpen(false);
      setReason("");
      setDescription("");
    } catch (error) {
      console.error("Report feed post error:", error);
      toast.error("Failed to submit report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-red-600"
      >
        <Flag size={14} />
        Report
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Report Post
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Tell us why you are reporting this post.
            </p>

            <div className="mt-5">
              <label
                htmlFor={`report-reason-${postId}`}
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Reason
              </label>

              <select
                id={`report-reason-${postId}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              >
                <option value="">Select a reason</option>

                {reasons.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label
                htmlFor={`report-description-${postId}`}
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Additional details
                <span className="ml-1 font-normal text-gray-400">
                  (optional)
                </span>
              </label>

              <textarea
                id={`report-description-${postId}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Provide any additional information..."
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!loading) {
                    setOpen(false);
                  }
                }}
                disabled={loading}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReport}
                disabled={loading || !reason}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}