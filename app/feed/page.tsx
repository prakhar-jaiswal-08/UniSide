import Link from "next/link";
import Image from "next/image";
import {
  MessageCircle,
  Plus,
  Image as ImageIcon,
  Video,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import FeedComments from "@/component/feed/FeedComments";
import MessageButton from "@/component/MessageButton";
import FeedPostActions from "@/component/feed/FeedPostActions";
import ReportFeedPostButton from "@/component/feed/ReportFeedPostButton";

type FeedPost = {
  id: number;
  user_id: string;
  content: string | null;
  media_url: string | null;
  media_type: "none" | "image" | "video";
  created_at: string;
  updated_at: string;
};

type PublicProfile = {
  id: string;
  name: string | null;
};

type SearchParams = {
  page?: string;
};

const POSTS_PER_PAGE = 10;

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const currentPage = Math.max(
    1,
    Number(params.page) || 1
  );

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    isAdmin = profile?.role === "admin";
  }

  const from =
    (currentPage - 1) * POSTS_PER_PAGE;

  const to =
    from + POSTS_PER_PAGE - 1;

  const {
    data: posts,
    error,
    count,
  } = await supabase
    .from("feed_posts")
    .select("*", { count: "exact" })
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  if (error) {
    console.error("Failed to load feed:", error);
  }

  const feedPosts: FeedPost[] = posts ?? [];

  const totalPosts = count ?? 0;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalPosts / POSTS_PER_PAGE
    )
  );

  /*
   * Find the first image on the current page.
   * Only this image gets priority loading because
   * it may become the Largest Contentful Paint image.
   */
  const firstImagePostId =
    feedPosts.find(
      (post) =>
        post.media_type === "image" &&
        post.media_url
    )?.id;

  const userIds = [
    ...new Set(
      feedPosts.map(
        (post) => post.user_id
      )
    ),
  ];

  let profiles: PublicProfile[] = [];

  if (userIds.length > 0) {
    const { data } = await supabase
      .from("public_profiles")
      .select("id, name")
      .in("id", userIds);

    profiles = data ?? [];
  }

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ])
  );

  function buildPageUrl(page: number) {
    return page > 1
      ? `/feed?page=${page}`
      : "/feed";
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Campus Feed
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              See what&apos;s happening around your college.
            </p>
          </div>

          <Link
            href="/feed/create"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <Plus size={17} />
            Create Post
          </Link>
        </div>

        {/* Feed */}
        {feedPosts.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <MessageCircle
              size={42}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No posts yet
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Be the first student to share something happening on campus.
            </p>

            <Link
              href="/feed/create"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <Plus size={17} />
              Create the first post
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {feedPosts.map((post) => {
                const profile =
                  profileMap.get(
                    post.user_id
                  );

                const formattedDate =
                  new Date(
                    post.created_at
                  ).toLocaleString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }
                  );

                const canManagePost =
                  user?.id ===
                    post.user_id ||
                  isAdmin;

                return (
                  <article
                    id={`post-${post.id}`}
                    key={post.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                  >
                    {/* Post header */}
                    <div className="flex items-center justify-between px-5 py-4">
                      <Link
                        href={`/profile/user/${post.user_id}`}
                        className="flex min-w-0 items-center gap-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                          {(
                            profile?.name?.charAt(
                              0
                            ) ?? "U"
                          ).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {profile?.name ??
                              "Unknown Student"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {formattedDate}
                          </p>
                        </div>
                      </Link>

                      {/* Owner / Admin actions */}
                      {canManagePost && (
                        <FeedPostActions
                          postId={post.id}
                          mediaUrl={
                            post.media_url
                          }
                          isAdmin={
                            isAdmin &&
                            user?.id !==
                              post.user_id
                          }
                        />
                      )}
                    </div>

                    {/* Post content */}
                    {post.content && (
                      <div className="px-5 pb-4">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800">
                          {post.content}
                        </p>
                      </div>
                    )}

                    {/* Image */}
                    {post.media_url &&
                      post.media_type ===
                        "image" && (
                        <div className="border-y border-gray-100 bg-gray-50">
                          <Image
                            src={
                              post.media_url
                            }
                            alt="Campus post"
                            width={1200}
                            height={800}
                            sizes="(max-width: 640px) 100vw, 896px"
                            priority={
                              post.id ===
                              firstImagePostId
                            }
                            className="h-auto max-h-[600px] w-full object-contain"
                          />
                        </div>
                      )}

                    {/* Video */}
                    {post.media_url &&
                      post.media_type ===
                        "video" && (
                        <div className="border-y border-gray-100 bg-black">
                          <video
                            src={
                              post.media_url
                            }
                            controls
                            preload="metadata"
                            className="max-h-[600px] w-full"
                          />
                        </div>
                      )}

                    {/* Post actions */}
                    <div className="px-5 py-4">
                      <div className="mt-3 flex items-center">
                        <ReportFeedPostButton
                          postId={post.id}
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        {post.media_type ===
                          "image" && (
                          <span className="inline-flex items-center gap-2 text-xs text-gray-400">
                            <ImageIcon
                              size={15}
                            />
                            Photo
                          </span>
                        )}

                        {post.media_type ===
                          "video" && (
                          <span className="inline-flex items-center gap-2 text-xs text-gray-400">
                            <Video
                              size={15}
                            />
                            Video
                          </span>
                        )}
                      </div>

                      <MessageButton
                        sellerId={
                          post.user_id
                        }
                        listingId={String(
                          post.id
                        )}
                        listingType="feed"
                        buttonText="Message Author"
                      />
                    </div>

                    {/* Comments */}
                    <FeedComments
                      postId={post.id}
                    />
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">

                {currentPage > 1 ? (
                  <Link
                    href={buildPageUrl(
                      currentPage - 1
                    )}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <ChevronLeft
                      size={17}
                    />
                    Previous
                  </Link>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400">
                    <ChevronLeft
                      size={17}
                    />
                    Previous
                  </span>
                )}

                <span className="px-3 text-sm text-gray-500">
                  Page {currentPage} of{" "}
                  {totalPages}
                </span>

                {currentPage <
                totalPages ? (
                  <Link
                    href={buildPageUrl(
                      currentPage + 1
                    )}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Next
                    <ChevronRight
                      size={17}
                    />
                  </Link>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400">
                    Next
                    <ChevronRight
                      size={17}
                    />
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}