"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import ConfirmDialog from "@/component/ui/ConfirmDialog";

type Props = {
  postId: number;
  mediaUrl: string | null;
  isAdmin?: boolean;
};

export default function FeedPostActions({
  postId,
  mediaUrl,
  isAdmin = false,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleEdit() {
    router.push(`/feed/edit/${postId}`);
  }

  async function removeMedia() {
    if (!mediaUrl) return;

    try {
      const url = new URL(mediaUrl);
      const marker =
        "/storage/v1/object/public/feed-media/";

      const markerIndex = url.pathname.indexOf(marker);

      if (markerIndex !== -1) {
        const filePath = decodeURIComponent(
          url.pathname.slice(
            markerIndex + marker.length
          )
        );

        if (filePath) {
          await supabase.storage
            .from("feed-media")
            .remove([filePath]);
        }
      }
    } catch (storageError) {
      console.error(
        "Failed to remove feed media:",
        storageError
      );
    }
  }

  async function handleDelete() {
    if (loading) return;

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please login first.");
        router.push("/login");
        return;
      }

      if (isAdmin) {
        const { error } = await supabase.rpc(
          "admin_delete_feed_post",
          {
            p_post_id: postId,
          }
        );

        if (error) {
          console.error(
            "Failed to delete feed post as admin:",
            error
          );

          toast.error("Failed to remove post.");
          return;
        }

        await removeMedia();

        toast.success("Post removed by admin.");
        setOpen(false);
        router.refresh();
        return;
      }

      /*
       * Normal users can only delete their own posts.
       * RLS enforces this ownership check.
       */
      const { error: deleteError } = await supabase
        .from("feed_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);

      if (deleteError) {
        console.error(
          "Failed to delete feed post:",
          deleteError
        );

        toast.error("Failed to delete post.");
        return;
      }

      await removeMedia();

      toast.success("Post deleted.");
      setOpen(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Delete feed post error:",
        error
      );

      toast.error("Failed to delete post.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {!isAdmin && (
          <button
            type="button"
            onClick={handleEdit}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-gray-900 disabled:opacity-50"
          >
            <Pencil size={14} />
            Edit
          </button>
        )}

        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={loading}
          className={`inline-flex items-center gap-1.5 text-xs font-medium transition disabled:opacity-50 ${
            isAdmin
              ? "text-red-600 hover:text-red-800"
              : "text-red-500 hover:text-red-700"
          }`}
        >
          {isAdmin ? (
            <ShieldCheck size={14} />
          ) : (
            <Trash2 size={14} />
          )}

          {isAdmin ? "Remove Post" : "Delete"}
        </button>
      </div>

      <ConfirmDialog
        open={open}
        title={
          isAdmin
            ? "Remove post as admin?"
            : "Delete post?"
        }
        description={
          isAdmin
            ? "This post and its attached media will be permanently removed. This action cannot be undone."
            : "This post and its attached media will be permanently removed. This action cannot be undone."
        }
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