import Link from "next/link";
import {
  Package,
  Wrench,
  Home,
} from "lucide-react";

import ProductCard from "@/component/ProductCard";
import WishlistButton from "@/component/WishlistButton";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  status: string;
  description: string | null;
};

type Service = {
  id: number;
  title: string;
  price: number;
  image_url: string | null;
  category: string;
  status: string;
  description: string | null;
  pricing_type?: string;
};

type Roommate = {
  id: string;
  name: string;
  college: string;
  location: string;
  budget: number;
  room_type: string;
  image_url: string | null;
  status: string;
  description: string | null;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  const query = q.trim();

  if (!query) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-950">
          Search
        </h1>

        <p className="mt-2 text-gray-500">
          Search for products, services, or roommates.
        </p>
      </main>
    );
  }

  const searchPattern = `%${query}%`;

  /*
   * Search products
   * Searches name, description and category.
   */
  const { data: products, error: productsError } =
    await supabase
      .from("products")
      .select(
        "id, name, price, image_url, category, status, description"
      )
      .or(
        `name.ilike.${searchPattern},description.ilike.${searchPattern},category.ilike.${searchPattern}`
      )
      .order("created_at", {
        ascending: false,
      });

  /*
   * Search services
   * Searches title, description and category.
   */
  const { data: services, error: servicesError } =
    await supabase
      .from("services")
      .select(
        "id, title, price, image_url, category, status, description, pricing_type"
      )
      .or(
        `title.ilike.${searchPattern},description.ilike.${searchPattern},category.ilike.${searchPattern}`
      )
      .order("created_at", {
        ascending: false,
      });

  /*
   * Search roommates
   * Searches name, college, location and description.
   */
  const { data: roommates, error: roommatesError } =
    await supabase
      .from("roommates")
      .select(
        "id, name, college, location, budget, room_type, image_url, status, description"
      )
      .or(
        `name.ilike.${searchPattern},college.ilike.${searchPattern},location.ilike.${searchPattern},room_type.ilike.${searchPattern},description.ilike.${searchPattern}`
      )
      .order("created_at", {
        ascending: false,
      });

  if (productsError) {
    console.error(
      "Search products error:",
      productsError
    );
  }

  if (servicesError) {
    console.error(
      "Search services error:",
      servicesError
    );
  }

  if (roommatesError) {
    console.error(
      "Search roommates error:",
      roommatesError
    );
  }

  const productResults = products ?? [];
  const serviceResults = services ?? [];
  const roommateResults = roommates ?? [];

  const totalResults =
    productResults.length +
    serviceResults.length +
    roommateResults.length;

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
          Search Results
        </h1>

        <p className="mt-2 text-gray-500">
          Showing results for{" "}
          <span className="font-semibold text-gray-950">
            "{query}"
          </span>
        </p>

        <p className="mt-1 text-sm text-gray-400">
          {totalResults}{" "}
          {totalResults === 1
            ? "result"
            : "results"}{" "}
          found
        </p>
      </div>

      {/* No results */}
      {totalResults === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
            <Package
              size={22}
              className="text-gray-400"
            />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-950">
            No results found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Try searching with a different keyword.
          </p>
        </div>
      )}

      {/* Products */}
      {productResults.length > 0 && (
        <section>
          <SectionHeader
            icon={<Package size={19} />}
            title="Products"
            count={productResults.length}
          />

          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productResults.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image_url={product.image_url}
                category={product.category}
                status={product.status}
              />
            ))}
          </div>
        </section>
      )}

      {/* Services */}
      {serviceResults.length > 0 && (
        <section className="mt-12">
          <SectionHeader
            icon={<Wrench size={19} />}
            title="Services"
            count={serviceResults.length}
          />

          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceResults.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="truncate text-lg font-semibold text-gray-950">
                    {service.title}
                  </h3>

                  <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                    {service.status}
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  {service.category}
                </p>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-500">
                  {service.description}
                </p>

                <div className="mt-5 flex items-end justify-between">
                  <p className="text-lg font-bold text-gray-950">
                    {service.pricing_type === "Free"
                      ? "Free"
                      : service.price
                        ? `₹${service.price}`
                        : "Contact"}
                  </p>

                  <span className="text-sm font-medium text-gray-500 transition group-hover:text-gray-950">
                    View Details
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Roommates */}
      {roommateResults.length > 0 && (
        <section className="mt-12 pb-8">
          <SectionHeader
            icon={<Home size={19} />}
            title="Roommates"
            count={roommateResults.length}
          />

          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roommateResults.map((roommate) => (
              <Link
                key={roommate.id}
                href={`/roommates/${roommate.id}`}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {roommate.image_url ? (
                    <img
                      src={roommate.image_url}
                      alt={roommate.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Home
                        size={42}
                        className="text-gray-300"
                      />
                    </div>
                  )}

                  <div
                    className="absolute right-3 top-3"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <WishlistButton
                      listingId={roommate.id}
                      listingType="roommate"
                    />
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="truncate text-lg font-semibold text-gray-950">
                      {roommate.name}
                    </h3>

                    <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium capitalize text-gray-600">
                      {roommate.status}
                    </span>
                  </div>

                  <p className="mt-2 truncate text-sm text-gray-500">
                    {roommate.college}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {roommate.location}
                  </p>

                  <p className="mt-4 text-lg font-bold text-gray-950">
                    ₹
                    {Number(
                      roommate.budget
                    ).toLocaleString("en-IN")}
                    <span className="text-sm font-medium text-gray-400">
                      /month
                    </span>
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {roommate.room_type}
                  </p>

                  <span className="mt-4 inline-flex text-sm font-medium text-gray-500 transition group-hover:text-gray-950">
                    View Details
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm">
        {icon}
      </div>

      <h2 className="text-xl font-semibold tracking-tight text-gray-950">
        {title}
      </h2>

      <span className="text-sm text-gray-400">
        {count}
      </span>
    </div>
  );
}