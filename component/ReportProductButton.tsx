"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Props = {
  productId: number;
  sellerId: string;
};

export default function ReportProductButton({
  productId,
  sellerId,
}: Props) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);

  async function submitReport() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login first.");
      return;
    }

    if (user.id === sellerId) {
      toast.error("You cannot report your own listing.");
      return;
    }

    if (!reason) {
      toast.error("Please select a reason.");
      return;
    }

    // Insert report
    const { error } = await supabase.from("reports").insert({
      product_id: productId,
      reporter_id: user.id,
      reason,
      description,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("You have already reported this product.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    // Increase report count
    

    toast.success("Report submitted successfully.");

    setReason("");
    setDescription("");
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
      >
        <Flag size={18} />
        <span>Report Product</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Report Product
            </h2>

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-5 w-full rounded-lg border p-3 text-gray-900"
            >
              <option value="">Select Reason</option>
              <option>Spam</option>
              <option>Fake Product</option>
              <option>Wrong Category</option>
              <option>Offensive Content</option>
              <option>Scam</option>
              <option>Other</option>
            </select>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details (optional)"
              className="mt-4 h-32 w-full rounded-lg border p-3 text-gray-900"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-800 transition hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={submitReport}
                className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white transition hover:bg-red-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}