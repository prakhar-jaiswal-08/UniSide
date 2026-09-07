"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadFeedMedia } from "@/lib/uploadFeedMedia";
import { toast } from "sonner";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

type MediaType = "none" | "image" | "video";

export default function EditFeedPostPage() {
  const params = useParams();
  const router = useRouter();

  const postId = String(params.id);

  const [content, setContent] = useState("");
  const [existingMediaUrl, setExistingMediaUrl] = useState<string | null>(
    null
  );
  const [existingMediaType, setExistingMediaType] =
    useState<MediaType>("none");

  const [newFile, setNewFile] = useState<File | null>(null);
  const [newMediaType, setNewMediaType] =
    useState<MediaType>("none");

  const [removeExistingMedia, setRemoveExistingMedia] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  async function loadPost() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: post, error } = await supabase
      .from("feed_posts")
      .select("*")
      .eq("id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !post) {
      toast.error("Post not found or you don't have permission to edit it.");
      router.push("/feed");
      return;
    }

    setContent(post.content ?? "");
    setExistingMediaUrl(post.media_url);
    setExistingMediaType(post.media_type);
    setLoading(false);
  }

  function handleFileChange(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (selectedFile.type.startsWith("image/")) {
      if (selectedFile.size > MAX_IMAGE_SIZE) {
        toast.error("Image must be 10 MB or smaller.");
        e.target.value = "";
        return;
      }

      setNewFile(selectedFile);
      setNewMediaType("image");
      setRemoveExistingMedia(true);
      return;
    }

    if (selectedFile.type.startsWith("video/")) {
      if (selectedFile.size > MAX_VIDEO_SIZE) {
        toast.error("Video must be 50 MB or smaller.");
        e.target.value = "";
        return;
      }

      setNewFile(selectedFile);
      setNewMediaType("video");
      setRemoveExistingMedia(true);
      return;
    }

    toast.error("Please select an image or video.");
    e.target.value = "";
  }

  async function deleteStorageFile(mediaUrl: string | null) {
    if (!mediaUrl) return;

    try {
      const url = new URL(mediaUrl);

      const marker =
        "/storage/v1/object/public/feed-media/";

      const markerIndex = url.pathname.indexOf(marker);

      if (markerIndex === -1) return;

      const filePath = decodeURIComponent(
        url.pathname.slice(markerIndex + marker.length)
      );

      if (!filePath) return;

      const { error } = await supabase.storage
        .from("feed-media")
        .remove([filePath]);

      if (error) {
        console.error(
          "Failed to remove feed media:",
          error
        );
      }
    } catch (error) {
      console.error(
        "Failed to process media URL:",
        error
      );
    }
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!content.trim() && !existingMediaUrl && !newFile) {
      toast.error(
        "A post must contain text or media."
      );
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please login first.");
        router.push("/login");
        return;
      }

      let mediaUrl = existingMediaUrl;
      let mediaType = existingMediaType;

      /*
       * Upload new media first.
       */
      if (newFile) {
        mediaUrl = await uploadFeedMedia(
          newFile,
          user.id
        );

        mediaType = newMediaType;
      } else if (removeExistingMedia) {
        mediaUrl = null;
        mediaType = "none";
      }

      /*
       * Update the post.
       *
       * RLS ensures the authenticated user can only
       * update their own post.
       */
      const { error: updateError } = await supabase
        .from("feed_posts")
        .update({
          content: content.trim() || null,
          media_url: mediaUrl,
          media_type: mediaType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId)
        .eq("user_id", user.id);

      if (updateError) {
        console.error(
          "Failed to update feed post:",
          updateError
        );

        /*
         * If a new file was uploaded but the database
         * update failed, attempt to remove the new file.
         */
        if (newFile && mediaUrl) {
          await deleteStorageFile(mediaUrl);
        }

        toast.error("Failed to update post.");
        return;
      }

      /*
       * Remove old media after the database update succeeds.
       */
      if (
        existingMediaUrl &&
        (newFile || removeExistingMedia)
      ) {
        await deleteStorageFile(existingMediaUrl);
      }

      toast.success("Post updated.");
      router.push("/feed");
      router.refresh();
    } catch (error) {
      console.error(
        "Edit feed post error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update post."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-gray-500">
            Loading post...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <Link
          href="/feed"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft size={17} />
          Back to Feed
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Post
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Update your campus post.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                What&apos;s happening?
              </label>

              <textarea
                id="content"
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }
                rows={7}
                maxLength={5000}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />

              <p className="mt-1 text-right text-xs text-gray-400">
                {content.length}/5000
              </p>
            </div>

            {/* Existing media */}
            {existingMediaUrl &&
              !removeExistingMedia &&
              !newFile && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-800">
                    Current media
                  </p>

                  {existingMediaType === "image" && (
                    <img
                      src={existingMediaUrl}
                      alt="Current post media"
                      className="max-h-[500px] w-full rounded-lg bg-gray-50 object-contain"
                    />
                  )}

                  {existingMediaType === "video" && (
                    <video
                      src={existingMediaUrl}
                      controls
                      className="max-h-[500px] w-full rounded-lg bg-black"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setRemoveExistingMedia(true)
                    }
                    className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove current media
                  </button>
                </div>
              )}

            {/* New media */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Replace media
              </label>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-sm text-gray-600 transition hover:border-gray-400 hover:bg-gray-100">
                {newMediaType === "video" ? (
                  <Video size={20} />
                ) : (
                  <ImageIcon size={20} />
                )}

                <span>
                  {newFile
                    ? newFile.name
                    : "Choose a new photo or video"}
                </span>

                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <p className="mt-2 text-xs text-gray-400">
                Images up to 10 MB. Videos up to 50 MB.
              </p>

              {newFile && (
                <button
                  type="button"
                  onClick={() => {
                    setNewFile(null);
                    setNewMediaType("none");
                    setRemoveExistingMedia(false);
                  }}
                  className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Cancel new media
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
              <Link
                href="/feed"
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}