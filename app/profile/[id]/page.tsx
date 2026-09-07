import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  User,
  Wrench,
  MapPin,
  CheckCircle,
  Clock3,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase-server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PublicProviderProfile({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  /* Provider */

  const { data: provider, error: providerError } =
    await supabase
      .from("profiles")
      .select("id, name")
      .eq("id", id)
      .single();

  if (providerError || !provider) {
    notFound();
  }

  /* Provider services */

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("user_id", id)
    .order("created_at", {
      ascending: false,
    });

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">

      {/* Back */}

      <Link
        href="/services"
        className="mb-8 inline-block text-blue-600 hover:underline"
      >
        ← Back to Services
      </Link>

      {/* Profile Header */}

      <section className="rounded-2xl bg-white p-8 shadow-xl">

        <div className="flex flex-col items-center gap-6 sm:flex-row">

          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
            <User
              size={48}
              className="text-blue-600"
            />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {provider.name ?? "Student Provider"}
            </h1>

            <p className="mt-2 text-gray-500">
              Campus service provider
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {services?.length ?? 0} service
              {(services?.length ?? 0) === 1
                ? ""
                : "s"} listed
            </p>
          </div>

        </div>

      </section>

      {/* Services */}

      <section className="mt-12">

        <h2 className="text-3xl font-bold">
          Services by {provider.name ?? "this provider"}
        </h2>

        {services && services.length > 0 ? (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className={`overflow-hidden rounded-2xl border bg-white shadow transition hover:-translate-y-1 hover:shadow-xl ${
                  service.status === "Completed"
                    ? "opacity-75"
                    : ""
                }`}
              >

                {/* Image */}

                <div className="relative h-52 w-full bg-gray-100">

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

                  <div className="flex items-center justify-between gap-3">

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
                      {service.status === "Available" && (
                        <CheckCircle size={14} />
                      )}

                      {service.status === "Reserved" && (
                        <Clock3 size={14} />
                      )}

                      {service.status === "Completed" && (
                        <XCircle size={14} />
                      )}

                      {service.status}
                    </span>

                  </div>

                  <h3 className="mt-4 text-2xl font-bold text-gray-900">
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
                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={15} />
                      {service.location}
                    </p>
                  )}

                  <div className="mt-6 rounded-lg bg-blue-600 py-3 text-center font-semibold text-white">
                    View Service
                  </div>

                </div>

              </Link>
            ))}

          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed py-20 text-center">

            <Wrench
              size={60}
              className="mx-auto text-gray-400"
            />

            <h3 className="mt-5 text-2xl font-bold">
              No Services Listed
            </h3>

            <p className="mt-2 text-gray-500">
              This provider hasn't listed any services yet.
            </p>

          </div>
        )}

      </section>

    </main>
  );
}