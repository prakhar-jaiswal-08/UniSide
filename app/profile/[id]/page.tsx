import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Package,
  Wrench,
  Home,
} from "lucide-react";

import { createClient } from "@/lib/supabase-server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PublicProfilePage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  // Public profile information
  const { data: profile, error: profileError } =
    await supabase
      .from("public_profiles")
      .select(
        "id, name, age, college, department, year"
      )
      .eq("id", id)
      .single();

  if (profileError || !profile) {
    notFound();
  }

  // Fetch all listings created by this user
  const [
    { data: products },
    { data: services },
    { data: roommates },
  ] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, price, image_url, category, created_at"
      )
      .eq("user_id", id)
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("services")
      .select(
        "id, title, description, category, location, price, pricing_type, image_url, status, created_at"
      )
      .eq("user_id", id)
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("roommates")
      .select(
        "id, name, location, budget, room_type, image_url, status, created_at"
      )
      .eq("user_id", id)
      .order("created_at", {
        ascending: false,
      }),
  ]);

  const productListings = products ?? [];
  const serviceListings = services ?? [];
  const roommateListings = roommates ?? [];

  const totalListings =
    productListings.length +
    serviceListings.length +
    roommateListings.length;

  return (
    <main className="min-h-screen bg-gray-100 px-5 py-8 font-sans text-gray-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-950"
        >
          <ArrowLeft size={17} />
          Back
        </Link>

        {/* Profile Header */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              {/* Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-900 text-2xl font-bold uppercase text-white">
                {profile.name?.charAt(0) || "?"}
              </div>

              {/* Information */}
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                  {profile.name}
                </h1>

                {profile.college && (
                  <p className="mt-1 text-sm text-gray-500">
                    {profile.college}
                  </p>
                )}

                {(profile.department ||
                  profile.year) && (
                  <p className="mt-1 text-sm text-gray-500">
                    {[
                      profile.department,
                      profile.year
                        ? `Year ${profile.year}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* Listing Summary */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-950">
              Listings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {totalListings}{" "}
              {totalListings === 1
                ? "listing"
                : "listings"}
            </p>
          </div>
        </div>

        {/* Empty State */}
        {totalListings === 0 && (
          <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
            <Package
              size={42}
              className="mx-auto text-gray-400"
            />

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No listings yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {profile.name} hasn't created any
              listings yet.
            </p>
          </div>
        )}

        {/* Products */}
        {productListings.length > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <Package
                size={20}
                className="text-gray-700"
              />

              <h2 className="text-xl font-bold text-gray-950">
                Products
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {productListings.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {product.image_url ? (
                    <div className="relative h-52 w-full bg-gray-100">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-gray-100">
                      <Package
                        size={40}
                        className="text-gray-400"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    {product.category && (
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {product.category}
                      </span>
                    )}

                    <h3 className="mt-3 line-clamp-2 text-lg font-semibold text-gray-950">
                      {product.name}
                    </h3>

                    <p className="mt-3 text-lg font-bold text-gray-950">
                      ₹{product.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {serviceListings.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <Wrench
                size={20}
                className="text-gray-700"
              />

              <h2 className="text-xl font-bold text-gray-950">
                Services
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {serviceListings.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {service.image_url ? (
                    <div className="relative h-52 w-full bg-gray-100">
                      <Image
                        src={service.image_url}
                        alt={service.title}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-gray-100">
                      <Wrench
                        size={40}
                        className="text-gray-400"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {service.category ||
                          "Service"}
                      </span>

                      {service.status && (
                        <span
                          className={`text-xs font-medium ${
                            service.status ===
                            "Available"
                              ? "text-green-600"
                              : service.status ===
                                  "Reserved"
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {service.status}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 line-clamp-2 text-lg font-semibold text-gray-950">
                      {service.title}
                    </h3>

                    {service.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                        {service.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {service.pricing_type ===
                        "Free"
                          ? "Free"
                          : service.price
                            ? `₹${service.price}`
                            : "Contact"}
                      </p>

                      {service.location && (
                        <div className="flex min-w-0 items-center gap-1 text-xs text-gray-500">
                          <MapPin
                            size={14}
                            className="shrink-0"
                          />

                          <span className="truncate">
                            {service.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Roommates */}
        {roommateListings.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <Home
                size={20}
                className="text-gray-700"
              />

              <h2 className="text-xl font-bold text-gray-950">
                Roommate Listings
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {roommateListings.map((roommate) => (
                <Link
                  key={roommate.id}
                  href={`/roommates/${roommate.id}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {roommate.image_url ? (
                    <div className="relative h-52 w-full bg-gray-100">
                      <Image
                        src={roommate.image_url}
                        alt={roommate.name}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-gray-100">
                      <Home
                        size={40}
                        className="text-gray-400"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {roommate.room_type ||
                          "Roommate"}
                      </span>

                      {roommate.status && (
                        <span
                          className={`text-xs font-medium ${
                            roommate.status ===
                            "available"
                              ? "text-green-600"
                              : roommate.status ===
                                  "filled"
                                ? "text-red-600"
                                : "text-yellow-600"
                          }`}
                        >
                          {roommate.status}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-gray-950">
                      {roommate.name}
                    </h3>

                    {roommate.location && (
                      <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin size={15} />
                        {roommate.location}
                      </div>
                    )}

                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <p className="text-lg font-bold text-gray-950">
                        ₹{roommate.budget}
                        <span className="ml-1 text-xs font-normal text-gray-500">
                          / month
                        </span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}