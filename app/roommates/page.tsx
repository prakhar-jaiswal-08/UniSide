import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  IndianRupee,
  CalendarDays,
  Users,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import WishlistButton from "@/component/WishlistButton";

type SearchParams = {
  search?: string;
  location?: string;
  room_type?: string;
  gender?: string;
  max_budget?: string;
  sort?: string;
  page?: string;
};

const ITEMS_PER_PAGE = 9;

export default async function RoommatesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const search = params.search?.trim() || "";
  const location = params.location?.trim() || "";
  const roomType = params.room_type || "";
  const gender = params.gender || "";
  const maxBudget = params.max_budget || "";
  const sort = params.sort || "newest";

  const currentPage = Math.max(1, Number(params.page) || 1);

  const supabase = await createClient();

  let query = supabase
    .from("roommates")
    .select("*", { count: "exact" })
    .eq("status", "available");

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,college.ilike.%${search}%,location.ilike.%${search}%`
    );
  }

  if (location) {
    query = query.ilike("location", `%${location}%`);
  }

  if (roomType) {
    query = query.eq("room_type", roomType);
  }

  if (gender) {
    query = query.eq("gender_preference", gender);
  }

  if (maxBudget && !Number.isNaN(Number(maxBudget))) {
    query = query.lte("budget", Number(maxBudget));
  }

  switch (sort) {
    case "oldest":
      query = query.order("created_at", {
        ascending: true,
      });
      break;

    case "budget_low":
      query = query.order("budget", {
        ascending: true,
      });
      break;

    case "budget_high":
      query = query.order("budget", {
        ascending: false,
      });
      break;

    default:
      query = query.order("created_at", {
        ascending: false,
      });
      break;
  }

  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const {
    data: roommates,
    error,
    count,
  } = await query.range(from, to);

  const totalPages = Math.max(
    1,
    Math.ceil((count || 0) / ITEMS_PER_PAGE)
  );

  const buildPageUrl = (page: number) => {
    const queryParams = new URLSearchParams();

    if (search) queryParams.set("search", search);
    if (location) queryParams.set("location", location);
    if (roomType) queryParams.set("room_type", roomType);
    if (gender) queryParams.set("gender", gender);
    if (maxBudget) {
      queryParams.set("max_budget", maxBudget);
    }

    if (sort !== "newest") {
      queryParams.set("sort", sort);
    }

    if (page > 1) {
      queryParams.set("page", String(page));
    }

    const queryString = queryParams.toString();

    return queryString
      ? `/roommates?${queryString}`
      : "/roommates";
  };

  return (
    <main className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* Header */}

        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users
                size={25}
                className="text-gray-900"
              />

              <h1 className="text-4xl font-bold tracking-tight text-gray-950">
                Roommate Finder
              </h1>
            </div>

            <p className="mt-2 text-gray-500">
              Find students looking for roommates and
              shared accommodation.
            </p>
          </div>

          <Link
            href="/roommates/create"
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 lg:self-auto"
          >
            <Plus size={17} />
            Create Listing
          </Link>
        </div>

        {/* Search & Filters */}

        <form
          method="GET"
          action="/roommates"
          className="mb-8 rounded-xl border border-gray-300 bg-white p-5 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal
              size={19}
              className="text-gray-700"
            />

            <h2 className="font-semibold text-gray-900">
              Find a Roommate
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr_1.3fr_1fr_1fr]">

            {/* Search */}

            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                name="search"
                defaultValue={search}
                placeholder="Search name, college or location"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            {/* Location */}

            <input
              name="location"
              defaultValue={location}
              placeholder="Location"
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />

            {/* Room Type */}

            <select
              name="room_type"
              defaultValue={roomType}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            >
              <option value="">
                All room types
              </option>

              <option value="Single">
                Single Room
              </option>

              <option value="Shared">
                Shared Room
              </option>

              <option value="1BHK">
                1 BHK
              </option>

              <option value="2BHK">
                2 BHK
              </option>

              <option value="PG">
                PG
              </option>

              <option value="Other">
                Other
              </option>
            </select>

            {/* Gender */}

            <select
              name="gender"
              defaultValue={gender}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            >
              <option value="">
                Any gender preference
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Any">
                Any
              </option>
            </select>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">

            {/* Budget */}

            <input
              name="max_budget"
              type="number"
              min="0"
              defaultValue={maxBudget}
              placeholder="Maximum monthly budget"
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />

            {/* Sort */}

            <select
              name="sort"
              defaultValue={sort}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            >
              <option value="newest">
                Newest first
              </option>

              <option value="oldest">
                Oldest first
              </option>

              <option value="budget_low">
                Budget: Low to High
              </option>

              <option value="budget_high">
                Budget: High to Low
              </option>
            </select>

            {/* Buttons */}

            <div className="flex gap-2">
              <button
                type="submit"
                className="h-11 rounded-lg bg-gray-900 px-5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Search
              </button>

              <Link
                href="/roommates"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
              >
                Clear
              </Link>
            </div>
          </div>
        </form>

        {/* Results Count */}

        {!error && (
          <div className="mb-5">
            <p className="text-sm text-gray-500">
              {count || 0}{" "}
              {count === 1
                ? "roommate listing"
                : "roommate listings"}{" "}
              found
            </p>
          </div>
        )}

        {/* Error */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Unable to load roommate listings. Please try
            again.
          </div>
        )}

        {/* Empty State */}

        {!error &&
          (!roommates ||
            roommates.length === 0) && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
              <Users
                className="mx-auto mb-4 h-10 w-10 text-gray-400"
              />

              <h2 className="text-xl font-semibold text-gray-900">
                No roommate listings found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or filters.
              </p>

              <Link
                href="/roommates/create"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                <Plus size={17} />
                Create Listing
              </Link>
            </div>
          )}

        {/* Listings */}

        {!error &&
          roommates &&
          roommates.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {roommates.map((roommate) => (
                  <div
                    key={roommate.id}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-300 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Image */}

                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                      {roommate.image_url ? (
                        <Image
                          src={roommate.image_url}
                          alt={roommate.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Users
                            size={60}
                            className="text-gray-400"
                          />
                        </div>
                      )}

                      {/* Availability */}

                      <div className="absolute left-3 top-3">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Available
                        </span>
                      </div>

                      {/* Wishlist */}

                      <div className="absolute right-3 top-3">
                        <WishlistButton
                          listingId={roommate.id}
                          listingType="roommate"
                        />
                      </div>
                    </div>

                    {/* Content */}

                    <Link
                      href={`/roommates/${roommate.id}`}
                      className="flex flex-1 flex-col"
                    >
                      <div className="flex flex-1 flex-col p-5">

                        <div className="mb-2 flex items-start justify-between gap-3">
                          <h2 className="line-clamp-1 text-xl font-semibold text-gray-900 transition group-hover:text-gray-700">
                            {roommate.name}
                          </h2>
                        </div>

                        <p className="mb-4 line-clamp-2 text-sm text-gray-500">
                          {roommate.description ||
                            "Looking for a suitable roommate."}
                        </p>

                        <div className="space-y-3 text-sm text-gray-600">

                          <div className="flex items-center gap-2">
                            <Users
                              size={16}
                              className="shrink-0 text-gray-400"
                            />

                            <span>
                              {roommate.college}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin
                              size={16}
                              className="shrink-0 text-gray-400"
                            />

                            <span>
                              {roommate.location}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <IndianRupee
                              size={16}
                              className="shrink-0 text-gray-400"
                            />

                            <span className="font-medium text-gray-900">
                              ₹
                              {Number(
                                roommate.budget
                              ).toLocaleString(
                                "en-IN"
                              )}
                              /month
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users
                              size={16}
                              className="shrink-0 text-gray-400"
                            />

                            <span>
                              {roommate.room_type}
                            </span>
                          </div>

                          {roommate.move_in_date && (
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={16}
                                className="shrink-0 text-gray-400"
                              />

                              <span>
                                Move in{" "}
                                {new Date(
                                  roommate.move_in_date
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {roommate.gender_preference && (
                          <div className="mt-5 border-t border-gray-200 pt-4 text-xs text-gray-500">
                            Preference:{" "}
                            <span className="font-medium text-gray-700">
                              {roommate.gender_preference}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Pagination */}

              {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                  {currentPage > 1 && (
                    <Link
                      href={buildPageUrl(
                        currentPage - 1
                      )}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Previous
                    </Link>
                  )}

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <Link
                      key={page}
                      href={buildPageUrl(page)}
                      className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
                        page === currentPage
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </Link>
                  ))}

                  {currentPage < totalPages && (
                    <Link
                      href={buildPageUrl(
                        currentPage + 1
                      )}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
      </div>
    </main>
  );
}