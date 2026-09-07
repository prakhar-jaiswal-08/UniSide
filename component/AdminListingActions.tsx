"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ConfirmDialog from "@/component/ui/ConfirmDialog";

type Props = {
  listingId: string;
  listingType: "product" | "service" | "roommate";
  listingTitle: string;
};

export default function AdminListingActions({
  listingId,
  listingType,
  listingTitle,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (loading) return;

    setLoading(true);

    const { error } = await supabase.rpc("admin_delete_listing", {
      p_listing_type: listingType,
      p_listing_id: listingId,
    });

    if (error) {
      console.error("Failed to remove listing:", error);
      setLoading(false);
      return;
    }

    window.location.reload();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 size={14} />
        {loading ? "Removing..." : "Remove"}
      </button>

      <ConfirmDialog
        open={open}
        title="Remove listing?"
        description={`"${listingTitle}" will be permanently removed from the marketplace. This action cannot be undone.`}
        onCancel={() => {
          if (!loading) {
            setOpen(false);
          }
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}