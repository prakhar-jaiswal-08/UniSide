import Link from "next/link";
import Image from "next/image";
import {
  Wrench,
  CheckCircle,
  Clock3,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = "" } = await searchParams;
  const query = search.trim();

let serviceQuery = supabase
  .from("services")
  .select("*");

if (query) {
  serviceQuery = serviceQuery.or(
    `title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`
  );
}

const { data: services, error } = await serviceQuery.order(
  "created_at",
  { ascending: false }
);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* Hero */}
      <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 px-10 py-16 text-white md:flex-row">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">
            Campus Services
          </p>

          <h1 className="text-5xl font-extrabold">
            Offer Your Skills.
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-blue-100">
            Find trusted student tutors, designers, developers,
            photographers and many more services inside your college.
          </p>

          <Link
            href="/services/create"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-semibold text-blue-700 transition hover:scale-105"
          >
            Offer a Service
          </Link>
        </div>

        <div className="rounded-full bg-white/20 p-8 backdrop-blur">
          <Wrench size={80} />
        </div>
      </div>

      {error && (
        <p className="mt-10 text-center text-red-500">
          {error.message}
        </p>
      )}

      {!error && (!services || services.length === 0) && (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed py-24">
          <Wrench size={70} className="text-gray-400" />

          <h2 className="mt-6 text-3xl font-bold">
            No Services Yet
          </h2>

          <p className="mt-3 text-gray-500">
            Be the first student to offer a service.
          </p>

          <Link
            href="/services/create"
            className="mt-8 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Offer the First Service
          </Link>
        </div>
      )}

      {services && services.length > 0 && (
        <div className="mt-16">
         <div className="mb-8">
  <h2 className="text-3xl font-bold">
    {query ? `Search Results for "${query}"` : "Available Services"}
  </h2>

  {query && (
    <p className="mt-2 text-gray-500">
      Showing matching services.
    </p>
  )}
</div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
               className={`overflow-hidden rounded-2xl border bg-white shadow transition hover:-translate-y-1 hover:shadow-xl ${
  service.status === "Completed" ? "opacity-75" : ""
}`}              >
                {/* Image */}

                <div className="relative h-56 w-full bg-gray-100">
                  {service.image_url ? (
                    <Image
                      src={service.image_url}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Wrench
                        size={60}
                        className="text-gray-400"
                      />
                    </div>
                  )}
                </div>

                {/* Content */}

                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      {service.category}
                    </span>

                   <span
  className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
    service.status === "Available"
      ? "bg-green-100 text-green-700"
      : service.status === "Reserved"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700"
  }`}
>
  {service.status === "Available" && <CheckCircle size={14} />}
  {service.status === "Reserved" && <Clock3 size={14} />}
  {service.status === "Completed" && <XCircle size={14} />}

  {service.status}
</span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900">
                    {service.title}
                  </h3>

                  <p className="mt-3 line-clamp-3 text-gray-600">
                    {service.description}
                  </p>

                  <p className="mt-5 text-xl font-bold text-blue-600">
                    {service.pricing_type === "Free"
                      ? "Free"
                      : service.price
                      ? `₹${service.price} • ${service.pricing_type}`
                      : "Contact"}
                  </p>

                  {service.location && (
                    <p className="mt-2 text-sm text-gray-500">
                      📍 {service.location}
                    </p>
                  )}

                  <button className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700">
                    View Details
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}