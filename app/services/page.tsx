import Link from "next/link";
import Image from "next/image";
import {
  Wrench,
  CheckCircle,
  Clock3,
  XCircle,
  MapPin,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import WishlistButton from "@/component/WishlistButton";

const serviceCategories = [
  "Tutoring",
  "Programming",
  "Graphic Design",
  "Photography",
  "Video Editing",
  "Assignment Help",
  "Notes & Printing",
  "Repair & Maintenance",
  "Fitness",
  "Music",
  "Other",
];

const SERVICES_PER_PAGE = 9;

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
    pricing?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  const query = params.search?.trim() ?? "";
  const category = params.category ?? "All";
  const status = params.status ?? "All";
  const pricing = params.pricing ?? "All";
  const sort = params.sort ?? "newest";

  const requestedPage = Number(params.page ?? "1");

  const currentPage =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  let serviceQuery = supabase
    .from("services")
    .select(
      "id,title,description,category,status,pricing_type,price,location,image_url,created_at",
      { count: "exact" }
    );

  /* Search */

  if (query) {
    serviceQuery = serviceQuery.or(
      `title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`
    );
  }

  /* Category */

  if (category !== "All") {
    serviceQuery = serviceQuery.eq(
      "category",
      category
    );
  }

  /* Status */

  if (status !== "All") {
    serviceQuery = serviceQuery.eq(
      "status",
      status
    );
  }

  /* Pricing */

  if (pricing === "Free") {
    serviceQuery = serviceQuery.eq(
      "pricing_type",
      "Free"
    );
  }

  if (pricing === "Paid") {
    serviceQuery = serviceQuery.gt(
      "price",
      0
    );
  }

  /* Sorting */

  if (sort === "oldest") {
    serviceQuery = serviceQuery.order(
      "created_at",
      {
        ascending: true,
      }
    );
  } else if (sort === "price-low") {
    serviceQuery = serviceQuery.order(
      "price",
      {
        ascending: true,
        nullsFirst: false,
      }
    );
  } else if (sort === "price-high") {
    serviceQuery = serviceQuery.order(
      "price",
      {
        ascending: false,
        nullsFirst: false,
      }
    );
  } else {
    serviceQuery = serviceQuery.order(
      "created_at",
      {
        ascending: false,
      }
    );
  }

  /* Pagination */

  const from =
    (currentPage - 1) *
    SERVICES_PER_PAGE;

  const to =
    from +
    SERVICES_PER_PAGE -
    1;

  serviceQuery = serviceQuery.range(
    from,
    to
  );

  const {
    data: services,
    error,
    count,
  } = await serviceQuery;

  const totalServices = count ?? 0;

  const totalPages = Math.ceil(
    totalServices /
      SERVICES_PER_PAGE
  );

  const hasFilters =
    !!query ||
    category !== "All" ||
    status !== "All" ||
    pricing !== "All";

  /* Page URL */

  function createPageUrl(page: number) {
    const urlParams =
      new URLSearchParams();

    if (query) {
      urlParams.set(
        "search",
        query
      );
    }

    if (category !== "All") {
      urlParams.set(
        "category",
        category
      );
    }

    if (status !== "All") {
      urlParams.set(
        "status",
        status
      );
    }

    if (pricing !== "All") {
      urlParams.set(
        "pricing",
        pricing
      );
    }

    if (sort !== "newest") {
      urlParams.set(
        "sort",
        sort
      );
    }

    urlParams.set(
      "page",
      page.toString()
    );

    return `/services?${urlParams.toString()}`;
  }

  return (
    <main className="mx-auto max-w-7xl bg-gray-100 px-6 py-10">

      {/* Hero */}

      <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-gray-300 bg-gray-200 px-10 py-16 text-gray-900 md:flex-row">

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-600">
            Campus Services
          </p>

          <h1 className="text-5xl font-bold tracking-tight">
            Offer Your Skills.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            Find trusted student tutors,
            designers, developers,
            photographers and many
            more services inside your
            college.
          </p>

          <Link
            href="/services/create"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-800"
          >
            Offer a Service
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="flex h-28 w-28 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-800 shadow-sm">
          <Wrench size={52} />
        </div>

      </div>

      {/* Error */}

      {error && (
        <p className="mt-10 text-center text-red-500">
          {error.message}
        </p>
      )}

      {/* Filters */}

      {!error && (
        <section className="mt-12 rounded-xl border border-gray-300 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-2">
            <Filter size={20} />

            <h2 className="text-xl font-bold">
              Filter & Sort Services
            </h2>
          </div>

          <form
            method="GET"
            action="/services"
            className="grid gap-5 md:grid-cols-5"
          >

            <input
              type="hidden"
              name="search"
              value={query}
            />

            {/* Category */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                name="category"
                defaultValue={category}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              >
                <option value="All">
                  All Categories
                </option>

                {serviceCategories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Status */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                name="status"
                defaultValue={status}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              >
                <option value="All">
                  All Statuses
                </option>

                <option value="Available">
                  Available
                </option>

                <option value="Reserved">
                  Reserved
                </option>

                <option value="Completed">
                  Completed
                </option>
              </select>
            </div>

            {/* Pricing */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Pricing
              </label>

              <select
                name="pricing"
                defaultValue={pricing}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              >
                <option value="All">
                  All Pricing
                </option>

                <option value="Free">
                  Free
                </option>

                <option value="Paid">
                  Paid
                </option>
              </select>
            </div>

            {/* Sort */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sort By
              </label>

              <select
                name="sort"
                defaultValue={sort}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              >
                <option value="newest">
                  Newest
                </option>

                <option value="oldest">
                  Oldest
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>
              </select>
            </div>

            {/* Apply / Clear */}

            <div className="flex items-end gap-3">

              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
              >
                <Filter size={18} />
                Apply
              </button>

              {hasFilters && (
                <Link
                  href="/services"
                  className="flex items-center justify-center rounded-lg border border-gray-300 px-4 py-3 text-gray-700 transition hover:bg-gray-100"
                  title="Clear filters"
                >
                  <X size={18} />
                </Link>
              )}

            </div>

          </form>
        </section>
      )}

      {/* Results */}

      {!error && (
        <section className="mt-16">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {query
                ? `Search Results for "${query}"`
                : "Available Services"}
            </h2>

            <p className="mt-2 text-gray-500">
              {totalServices} service
              {totalServices === 1
                ? ""
                : "s"} found
            </p>
          </div>

          {/* Empty State */}

          {(!services ||
            services.length === 0) && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-24 text-center">

              <Wrench
                size={64}
                className="text-gray-400"
              />

              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                {!hasFilters
                  ? "No Services Yet"
                  : query &&
                    category === "All" &&
                    status === "All" &&
                    pricing === "All"
                  ? "No Services Found"
                  : "No Matching Services"}
              </h2>

              <p className="mt-3 max-w-md text-gray-500">
                {!hasFilters
                  ? "Be the first student to offer a service."
                  : query &&
                    category === "All" &&
                    status === "All" &&
                    pricing === "All"
                  ? `We couldn't find any service matching "${query}".`
                  : "No services match your current search and filters. Try changing or clearing your filters."}
              </p>

              {!hasFilters ? (
                <Link
                  href="/services/create"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
                >
                  Offer the First Service
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <Link
                  href="/services"
                  className="mt-6 flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  <X size={18} />
                  Clear Search & Filters
                </Link>
              )}

            </div>
          )}

          {/* Service Cards */}

          {services &&
            services.length > 0 && (
              <>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

                  {services.map(
                    (service) => (
                      <article
                        key={service.id}
                        className={`flex h-full flex-col overflow-hidden rounded-xl border border-gray-300 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                          service.status ===
                          "Completed"
                            ? "opacity-75"
                            : ""
                        }`}
                      >

                        {/* Image */}

                        <div className="relative h-48 w-full overflow-hidden bg-gray-100">

                          {service.image_url ? (
                            <Image
                              src={
                                service.image_url
                              }
                              alt={
                                service.title
                              }
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition duration-300 hover:scale-[1.02]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Wrench
                                size={60}
                                className="text-gray-400"
                              />
                            </div>
                          )}

                          {/* Wishlist */}

                          <div className="absolute right-3 top-3">
                            <WishlistButton
                              listingId={service.id.toString()}
                              listingType="service"
                            />
                          </div>

                        </div>

                        {/* Content */}

                        <div className="flex flex-1 flex-col p-5">

                          {/* Category + Status */}

                          <div className="flex items-center justify-between gap-2">

                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                              {service.category}
                            </span>

                            <span
                              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                                service.status ===
                                "Available"
                                  ? "bg-green-100 text-green-700"
                                  : service.status ===
                                    "Reserved"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {service.status ===
                                "Available" && (
                                <CheckCircle
                                  size={13}
                                />
                              )}

                              {service.status ===
                                "Reserved" && (
                                <Clock3
                                  size={13}
                                />
                              )}

                              {service.status ===
                                "Completed" && (
                                <XCircle
                                  size={13}
                                />
                              )}

                              {service.status}
                            </span>

                          </div>

                          {/* Title */}

                          <h3 className="mt-3 line-clamp-2 text-xl font-semibold text-gray-900">
                            {service.title}
                          </h3>

                          {/* Description */}

                          <p className="mt-2 line-clamp-3 text-sm text-gray-500">
                            {service.description}
                          </p>

                          {/* Price */}

                          <p className="mt-3 text-2xl font-bold text-green-600">
                            {service.pricing_type ===
                            "Free"
                              ? "Free"
                              : service.price
                              ? `₹${service.price}`
                              : "Contact"}
                          </p>

                          {/* Pricing Type */}

                          {service.pricing_type &&
                            service.pricing_type !==
                              "Free" && (
                              <p className="mt-1 text-xs text-gray-500">
                                {service.pricing_type}
                              </p>
                            )}

                          {/* Location */}

                          {service.location && (
                            <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                              <MapPin
                                size={15}
                              />
                              {
                                service.location
                              }
                            </p>
                          )}

                          {/* View Details */}

                          <div className="mt-auto pt-5">

                            <Link
                              href={`/services/${service.id}`}
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700"
                            >
                              View Details
                              <ArrowRight
                                size={16}
                              />
                            </Link>

                          </div>

                        </div>
                      </article>
                    )
                  )}

                </div>

                {/* Pagination */}

                {totalPages > 1 && (
                  <div className="mt-12 flex flex-wrap items-center justify-center gap-2">

                    {/* Previous */}

                    {currentPage > 1 ? (
                      <Link
                        href={createPageUrl(
                          currentPage - 1
                        )}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
                      >
                        <ChevronLeft
                          size={18}
                        />
                        Previous
                      </Link>
                    ) : (
                      <span className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 font-medium text-gray-400">
                        <ChevronLeft
                          size={18}
                        />
                        Previous
                      </span>
                    )}

                    {/* Page Numbers */}

                    <div className="flex items-center gap-2">

                      {Array.from(
                        {
                          length:
                            totalPages,
                        },
                        (_, index) =>
                          index + 1
                      ).map((page) => (
                        <Link
                          key={page}
                          href={createPageUrl(
                            page
                          )}
                          className={`flex h-11 w-11 items-center justify-center rounded-lg font-semibold transition ${
                            page ===
                            currentPage
                              ? "bg-gray-900 text-white"
                              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </Link>
                      ))}

                    </div>

                    {/* Next */}

                    {currentPage <
                    totalPages ? (
                      <Link
                        href={createPageUrl(
                          currentPage + 1
                        )}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
                      >
                        Next
                        <ChevronRight
                          size={18}
                        />
                      </Link>
                    ) : (
                      <span className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 font-medium text-gray-400">
                        Next
                        <ChevronRight
                          size={18}
                        />
                        Next
                      </span>
                    )}

                  </div>
                )}

              </>
            )}

        </section>
      )}

    </main>
  );
}