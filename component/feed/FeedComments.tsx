"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  Send,
  MessageCircle,
  Reply,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Comment = {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  parent_comment_id: number | null;
  created_at: string;
  updated_at: string;
};

type Profile = {
  id: string;
  name: string | null;
};

type Props = {
  postId: number;
};

export default function FeedComments({ postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);

  const [text, setText] = useState("");

  const [replyingToId, setReplyingToId] = useState<number | null>(
    null
  );
  const [replyText, setReplyText] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  async function loadComments() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id ?? null);

    const { data, error } = await supabase
      .from("feed_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load comments:", error);
      setLoading(false);
      return;
    }

    const loadedComments = (data ?? []) as Comment[];

    setComments(loadedComments);

    const userIds = [
      ...new Set(
        loadedComments.map((comment) => comment.user_id)
      ),
    ];

    if (userIds.length > 0) {
      const { data: profileData } = await supabase
        .from("public_profiles")
        .select("id, name")
        .in("id", userIds);

      const profileMap: Record<string, string> = {};

      (profileData as Profile[] | null)?.forEach((profile) => {
        profileMap[profile.id] =
          profile.name ?? "Unknown Student";
      });

      setProfiles(profileMap);
    } else {
      setProfiles({});
    }

    setLoading(false);
  }

  async function addComment() {
    const trimmedText = text.trim();

    if (!trimmedText || submitting) return;

    if (!userId) {
      toast.error("Please login to comment.");
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase
      .from("feed_comments")
      .insert({
        post_id: postId,
        user_id: userId,
        content: trimmedText,
        parent_comment_id: null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment.");
      setSubmitting(false);
      return;
    }

    setComments((prev) => [...prev, data as Comment]);

    setProfiles((prev) => ({
      ...prev,
      [userId]: prev[userId] ?? "You",
    }));

    setText("");
    setSubmitting(false);
  }

  async function addReply(parentCommentId: number) {
    const trimmedText = replyText.trim();

    if (!trimmedText || submitting) return;

    if (!userId) {
      toast.error("Please login to reply.");
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase
      .from("feed_comments")
      .insert({
        post_id: postId,
        user_id: userId,
        content: trimmedText,
        parent_comment_id: parentCommentId,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Failed to add reply:", error);
      toast.error("Failed to add reply.");
      setSubmitting(false);
      return;
    }

    setComments((prev) => [...prev, data as Comment]);

    setProfiles((prev) => ({
      ...prev,
      [userId]: prev[userId] ?? "You",
    }));

    setReplyText("");
    setReplyingToId(null);
    setSubmitting(false);
  }

  function startReply(commentId: number) {
    setEditingId(null);
    setEditingText("");
    setReplyingToId(commentId);
    setReplyText("");
  }

  function cancelReply() {
    setReplyingToId(null);
    setReplyText("");
  }

  function startEditing(comment: Comment) {
    setReplyingToId(null);
    setReplyText("");
    setEditingId(comment.id);
    setEditingText(comment.content);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingText("");
  }

  async function updateComment(commentId: number) {
    const trimmedText = editingText.trim();

    if (!trimmedText || submitting) return;

    if (!userId) return;

    setSubmitting(true);

    const updatedAt = new Date().toISOString();

    const { error } = await supabase
      .from("feed_comments")
      .update({
        content: trimmedText,
        updated_at: updatedAt,
      })
      .eq("id", commentId)
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to update comment:", error);
      toast.error("Failed to update comment.");
      setSubmitting(false);
      return;
    }

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              content: trimmedText,
              updated_at: updatedAt,
            }
          : comment
      )
    );

    cancelEditing();
    setSubmitting(false);
  }

  async function deleteComment(commentId: number) {
    if (!userId || submitting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) return;

    setSubmitting(true);

    const { error } = await supabase
      .from("feed_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment.");
      setSubmitting(false);
      return;
    }

    setComments((prev) =>
      prev.filter((comment) => comment.id !== commentId)
    );

    setSubmitting(false);
  }

  function getReplies(commentId: number) {
    return comments.filter(
      (comment) =>
        comment.parent_comment_id === commentId
    );
  }

  function renderComment(
    comment: Comment,
    isReply = false
  ) {
    const isOwner = userId === comment.user_id;
    const name =
      profiles[comment.user_id] ?? "Unknown Student";

    const replies = isReply
      ? []
      : getReplies(comment.id);

    return (
      <div
        key={comment.id}
        className={isReply ? "ml-10 flex gap-3" : "flex gap-3"}
      >
        {/* Avatar */}
        <Link
          href={`/profile/user/${comment.user_id}`}
          aria-label={`View ${name}'s profile`}
          className="h-8 w-8 shrink-0"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white transition hover:opacity-80">
            {name.charAt(0).toUpperCase()}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            {/* Name */}
            <Link
              href={`/profile/user/${comment.user_id}`}
              className="text-xs font-semibold text-gray-900 hover:underline"
            >
              {name}
            </Link>

            {editingId === comment.id ? (
              <div className="mt-2">
                <textarea
                  value={editingText}
                  onChange={(e) =>
                    setEditingText(e.target.value)
                  }
                  rows={3}
                  maxLength={2000}
                  className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500"
                />

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateComment(comment.id)
                    }
                    disabled={submitting}
                    className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={submitting}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                {comment.content}
              </p>
            )}
          </div>

          {/* Comment controls */}
          {editingId !== comment.id && (
            <div className="mt-1 flex flex-wrap items-center gap-3 px-1">
              <span className="text-xs text-gray-400">
                {new Date(
                  comment.created_at
                ).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>

              {/* Reply only available on top-level comments */}
              {!isReply && userId && (
                <button
                  type="button"
                  onClick={() =>
                    startReply(comment.id)
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900"
                >
                  <Reply size={12} />
                  Reply
                </button>
              )}

              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      startEditing(comment)
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteComment(comment.id)
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}

          {/* Reply input */}
          {replyingToId === comment.id && (
            <div className="mt-3 ml-2 flex items-end gap-2">
              <textarea
                value={replyText}
                onChange={(e) =>
                  setReplyText(e.target.value)
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();
                    addReply(comment.id);
                  }
                }}
                placeholder={`Reply to ${name}...`}
                rows={2}
                maxLength={2000}
                className="min-h-[42px] flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />

              <button
                type="button"
                onClick={() =>
                  addReply(comment.id)
                }
                disabled={
                  !replyText.trim() || submitting
                }
                aria-label="Post reply"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={16} />
              </button>

              <button
                type="button"
                onClick={cancelReply}
                disabled={submitting}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {replies.map((reply) =>
                renderComment(reply, true)
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const topLevelComments = comments.filter(
    (comment) => comment.parent_comment_id === null
  );

  return (
    <div className="border-t border-gray-100 px-5 py-4">
      <div className="mb-4 flex items-center gap-2">
        <MessageCircle
          size={18}
          className="text-gray-600"
        />

        <h3 className="text-sm font-semibold text-gray-900">
          Comments
        </h3>

        <span className="text-xs text-gray-400">
          ({comments.length})
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">
          Loading comments...
        </p>
      ) : comments.length === 0 ? (
        <p className="mb-4 text-sm text-gray-500">
          No comments yet. Be the first to comment.
        </p>
      ) : (
        <div className="mb-5 space-y-4">
          {topLevelComments.map((comment) =>
            renderComment(comment)
          )}
        </div>
      )}

      {/* Add comment */}
      {userId ? (
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
                addComment();
              }
            }}
            placeholder="Write a comment..."
            rows={2}
            maxLength={2000}
            className="min-h-[44px] flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          />

          <button
            type="button"
            onClick={addComment}
            disabled={!text.trim() || submitting}
            aria-label="Post comment"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={17} />
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Log in to join the conversation.
        </p>
      )}
    </div>
  );
}