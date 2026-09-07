"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ConfirmDialog from "@/component/ui/ConfirmDialog";

type Props = {
  roommateId: string;
  ownerId: string;
};

export default function RoommateOwnerActions({
  roommateId,
  ownerId,
}: Props) {
  const router = useRouter();

  const [isOwner, setIsOwner] = useState(false);
  const [checking, setChecking] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    async function checkOwner() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsOwner(!!user && user.id === ownerId);
      setChecking(false);
    }

    checkOwner();
  }, [ownerId]);

  async function handleDelete() {
    setDeleting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== ownerId) {
      setDeleting(false);
      return;
    }

    const { error } = await supabase
      .from("roommates")
      .delete()
      .eq("id", roommateId)
      .eq("user_id", ownerId);

    setDeleting(false);

    if (error) {
      alert(error.message);
      return;
    }

    setShowDeleteDialog(false);

    router.push("/roommates");
    router.refresh();
  }

  if (checking || !isOwner) {
    return null;
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/roommates/${roommateId}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"
        >
          <Edit size={16} />
          Edit Listing
        </Link>

        <button
          type="button"
          onClick={() => setShowDeleteDialog(true)}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 size={16} />
          {deleting ? "Deleting..." : "Delete Listing"}
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete roommate listing?"
        description="This action cannot be undone. Your roommate listing will be permanently deleted."
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}