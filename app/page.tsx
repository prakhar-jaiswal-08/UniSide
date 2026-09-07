import ProductCard from "../component/ProductCard";
import WishlistButton from "../component/WishlistButton";
import { supabase } from "../lib/supabase";
import Link from "next/link";
export const dynamic = "force-dynamic";
import {
  ArrowRight,
  Home as HomeIcon,
  Package,
  Wrench,
  MapPin,
} from "lucide-react";

export default async function Home() {
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: services, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: roommates, error: roommateError } = await supabase
    .from("roommates")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false })
    .limit(3);

  /* Fetch seller names for homepage products */
  const productUserIds = [
    ...new Set(
      (products ?? [])
        .map((product) => product.user_id)
        .filter(Boolean)
    ),
  ];

  let sellerMap = new Map<string, string>();

  if (productUserIds.length > 0) {
    const { data: sellers } = await supabase
      .from("public_profiles")
      .select("id, name")
      .in("id", productUserIds);

    sellerMap = new Map(
      (sellers ?? []).map((seller) => [
        seller.id,
        seller.name ?? "Unknown",
      ])
    );
  }

  const error =
    productError || serviceError || roommateError;

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-16 font-sans">
        <div className="mx-auto max-w-4xl rounded-xl border border-gray-300 bg-white p-8">
          <h1 className="text-xl font-semibold text-red-600">
            Something went wrong
          </h1>

          <p className="mt-2 text-gray-600">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 font-sans text-gray-900">

      {/* Hero */}
      <section className="border-b border-gray-300 bg-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
          <div className="max-w-3xl">

            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-gray-600">
              campus life just got easier.
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
              Everything students need,
              <br />
              in one place.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Buy and sell products, discover useful services,
              find roommates, and connect with your campus
              community through Uniside.
            </p>

           <div className="mt-8">
  <Link
    href="/feed"
    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-800"
  >
    Explore Feed
    <ArrowRight size={18} />
  </Link>
</div>

          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

        <SectionHeader
          icon={<Package size={22} />}
          title="Products"
          description="Buy and sell useful items with other students."
          href="/products"
        />

        {products && products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image_url={product.image_url}
                status={product.status}
                sellerName={
                  sellerMap.get(product.user_id) ?? "Unknown"
                }
              />
            ))}
          </div>
        ) : (
          <EmptySection
            message="No products have been listed yet."
            href="/products"
            buttonText="Browse products"
          />
        )}

      </section>

      {/* Services */}
      <section className="border-y border-gray-300 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

          <SectionHeader
            icon={<Wrench size={22} />}
            title="Services"
            description="Find skills and services offered by students."
            href="/services"
          />

          {services && services.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {services.map((service) => (
                <article
                  key={service.id}
                  className={`group flex h-full flex-col overflow-hidden rounded-xl border border-gray-300 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    service.status === "Completed"
                      ? "opacity-75"
                      : ""
                  }`}
                >

                  {/* Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">

                    {service.image_url ? (
                      <img
                        src={service.image_url}
                        alt={service.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Wrench
                          size={60}
                          className="text-gray-400"
                        />
                      </div>
                    )}

                    {/* Status */}
                    <div className="absolute left-3 top-3">
                      <span
                        className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                          service.status === "Available"
                            ? "bg-green-100 text-green-700"
                            : service.status === "Reserved"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {service.status === "Available" && (
                          <CheckCircleIcon />
                        )}

                        {service.status === "Reserved" && (
                          <ClockIcon />
                        )}

                        {service.status === "Completed" && (
                          <XCircleIcon />
                        )}

                        {service.status}
                      </span>
                    </div>

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

                    {/* Category */}
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {service.category}
                    </p>

                    {/* Title */}
                    <h3 className="mt-1 line-clamp-2 text-xl font-semibold text-gray-900">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {service.description}
                    </p>

                    {/* Price */}
                    <p className="mt-3 text-2xl font-bold text-green-600">
                      {service.pricing_type === "Free"
                        ? "Free"
                        : service.price
                        ? `₹${service.price}`
                        : "Contact"}
                    </p>

                    {/* Location */}
                    {service.location && (
                      <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={15} />
                        {service.location}
                      </p>
                    )}

                    {/* View Details */}
                    <div className="mt-auto pt-5">
                      <Link
                        href={`/services/${service.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700"
                      >
                        View Details
                        <ArrowRight size={16} />
                      </Link>
                    </div>

                  </div>
                </article>
              ))}

            </div>
          ) : (
            <EmptySection
              message="No services have been listed yet."
              href="/services"
              buttonText="Browse services"
            />
          )}

        </div>
      </section>

      {/* Roommates */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

        <SectionHeader
          icon={<HomeIcon size={22} />}
          title="Roommates"
          description="Find a suitable roommate near your college."
          href="/roommates"
        />

        {roommates && roommates.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {roommates.map((roommate) => (
              <article
                key={roommate.id}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-300 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">

                  {roommate.image_url ? (
                    <img
                      src={roommate.image_url}
                      alt={roommate.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <HomeIcon
                        size={60}
                        className="text-gray-400"
                      />
                    </div>
                  )}

                  {/* Status */}
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
                <div className="flex flex-1 flex-col p-5">

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Roommate
                  </p>

                  <h3 className="mt-1 line-clamp-2 text-xl font-semibold text-gray-900">
                    {roommate.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {roommate.college}
                  </p>

                  <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={15} />
                    {roommate.location}
                  </p>

                  <p className="mt-3 text-2xl font-bold text-green-600">
                    ₹{roommate.budget}/month
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {roommate.room_type}
                  </p>

                  {/* View Details */}
                  <div className="mt-auto pt-5">
                    <Link
                      href={`/roommates/${roommate.id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700"
                    >
                      View Details
                      <ArrowRight size={16} />
                    </Link>
                  </div>

                </div>
              </article>
            ))}

          </div>
        ) : (
          <EmptySection
            message="No roommate listings are available yet."
            href="/roommates"
            buttonText="Find a roommate"
          />
        )}

      </section>

      {/* Terms & Conditions */}
      <section className="border-t border-gray-300 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">

          <div className="max-w-3xl">

            <h2 className="text-xl font-semibold text-gray-900">
              Terms & Conditions
            </h2>

            <p className="mt-4 text-sm leading-7 text-gray-600">
              Uniside is a platform designed for students and members of
              the college community to buy and sell products, discover
              and offer services, find roommates, communicate with other
              users, and participate in the campus community through the
              Feed. Users are responsible for the accuracy of the
              information, listings, posts, comments, and other content
              they share. Users should exercise appropriate caution when
              communicating, meeting other users, or completing
              transactions through the platform.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">

              <Link
                href="/terms"
                className="font-medium text-gray-700 hover:text-gray-950 hover:underline"
              >
                Terms of Use
              </Link>

              <Link
                href="/privacy"
                className="font-medium text-gray-700 hover:text-gray-950 hover:underline"
              >
                Privacy Policy
              </Link>

            </div>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-6 text-sm text-gray-500">
            © {new Date().getFullYear()} Uniside.
            All rights reserved.
          </div>

        </div>
      </section>

    </main>
  );
}

/* Section Header */

function SectionHeader({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-6">

      <div>
        <div className="flex items-center gap-2 text-gray-900">

          {icon}

          <h2 className="text-2xl font-bold">
            {title}
          </h2>

        </div>

        <p className="mt-2 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <Link
        href={href}
        className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-950 sm:flex"
      >
        View all
        <ArrowRight size={16} />
      </Link>

    </div>
  );
}

/* Empty Section */

function EmptySection({
  message,
  href,
  buttonText,
}: {
  message: string;
  href: string;
  buttonText: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">

      <p className="text-gray-500">
        {message}
      </p>

      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
      >
        {buttonText}
        <ArrowRight size={16} />
      </Link>

    </div>
  );
}

/* Status Icons */

function CheckCircleIcon() {
  return <span className="text-xs">●</span>;
}

function ClockIcon() {
  return <span className="text-xs">●</span>;
}

function XCircleIcon() {
  return <span className="text-xs">●</span>;
}