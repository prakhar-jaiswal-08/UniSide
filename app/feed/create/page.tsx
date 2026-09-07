"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Video } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadFeedMedia } from "@/lib/uploadFeedMedia";
import { toast } from "sonner";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export default function CreateFeedPostPage() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"none" | "image" | "video">(
    "none"
  );
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setMediaType("none");
      return;
    }

    if (selectedFile.type.startsWith("image/")) {
      if (selectedFile.size > MAX_IMAGE_SIZE) {
        toast.error("Image must be 10 MB or smaller.");
        e.target.value = "";
        return;
      }

      setFile(selectedFile);
      setMediaType("image");
      return;
    }

    if (selectedFile.type.startsWith("video/")) {
      if (selectedFile.size > MAX_VIDEO_SIZE) {
        toast.error("Video must be 50 MB or smaller.");
        e.target.value = "";
        return;
      }

      setFile(selectedFile);
      setMediaType("video");
      return;
    }

    toast.error("Please select an image or video.");
    e.target.value = "";
    setFile(null);
    setMediaType("none");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!content.trim() && !file) {
      toast.error("Add some text or select a photo/video.");
      return;
    }

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

      let mediaUrl: string | null = null;

      if (file) {
        mediaUrl = await uploadFeedMedia(file, user.id);
      }

      const { error } = await supabase.from("feed_posts").insert({
        user_id: user.id,
        content: content.trim() || null,
        media_url: mediaUrl,
        media_type: file ? mediaType : "none",
      });

      if (error) {
        console.error("Failed to create feed post:", error);
        toast.error("Failed to create post.");
        return;
      }

      toast.success("Post created.");
      router.push("/feed");
      router.refresh();
    } catch (error) {
      console.error("Create feed post error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create post."
      );
    } finally {
      setLoading(false);
    }
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
              Create Post
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Share something happening around your college.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share an event, announcement, update, or anything useful for students..."
                rows={7}
                maxLength={5000}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />

              <p className="mt-1 text-right text-xs text-gray-400">
                {content.length}/5000
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Add photo or video
              </label>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-sm text-gray-600 transition hover:border-gray-400 hover:bg-gray-100">
                {mediaType === "video" ? (
                  <Video size={20} />
                ) : (
                  <ImageIcon size={20} />
                )}

                <span>
                  {file ? file.name : "Choose a photo or video"}
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

              {file && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setMediaType("none");
                  }}
                  className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Remove selected file
                </button>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
              <Link
                href="/feed"
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}