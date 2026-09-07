import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import MessageButton from "@/component/MessageButton";
import ReportServiceButton from "@/component/ReportServiceButton";
import WishlistButton from "@/component/WishlistButton";
import {
  Wrench,
  CheckCircle,
  Clock3,
  XCircle,
  MapPin,
  User,
  Calendar,
} from "lucide-react";
import ServiceOwnerActions from "@/component/ServiceOwnerActions";
import BackButton from "@/component/navigation/BackButton";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;

  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select(
      "title,description,category,location,price,pricing_type,image_url"
    )
    .eq("id", id)
    .maybeSingle();

  if (!service) {
    return {
      title: "Service Not Found",
      description:
        "This service is no longer available on Uniside.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    service.description?.trim()
      ? service.description.trim().slice(0, 160)
      : `Find ${service.title} on Uniside, the college marketplace for students.`;

  return {
    title: service.title,
    description,

    openGraph: {
      type: "website",
      title: `${service.title} | Uniside`,
      description,
      url: `/services/${id}`,
      ...(service.image_url
        ? {
            images: [
              {
                url: service.image_url,
                width: 1200,
                height: 800,
                alt: service.title,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: service.image_url
        ? "summary_large_image"
        : "summary",
      title: `${service.title} | Uniside`,
      description,
      ...(service.image_url
        ? {
            images: [service.image_url],
          }
        : {}),
    },

    alternates: {
      canonical: `/services/${id}`,
    },

    keywords: [
      service.title,
      service.category,
      service.location,
      "college services",
      "student services",
      "college marketplace",
      "Uniside",
    ].filter(Boolean),
  };
}

export default async function ServiceDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: service, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !service) {
    notFound();
  }

  const { data: provider } = await supabase
    .from("public_profiles")
    .select("id, name")
    .eq("id", service.user_id)
    .single();

  const statusClasses =
    service.status === "Available"
      ? "border-green-200 bg-green-50 text-green-700"
      : service.status === "Reserved"
        ? "border-yellow-200 bg-yellow-50 text-yellow-700"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <main className="min-h-screen bg-gray-100 px-5 py-8 font-sans text-gray-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <BackButton
          fallback="/services"
          label="Back to Services"
        />

        {/* Service */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid md:grid-cols-2">

            {/* Image */}
            <div className="border-b border-gray-200 bg-gray-50 md:border-b-0 md:border-r">
              {service.image_url ? (
                <div className="relative h-[360px] w-full sm:h-[450px] md:h-full md:min-h-[600px]">
                  <Image
                    src={service.image_url}
                    alt={service.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-[360px] w-full items-center justify-center bg-gray-100 sm:h-[450px] md:h-full md:min-h-[600px]">
                  <div className="text-center">
                    <Wrench
                      size={42}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 text-sm font-medium text-gray-400">
                      No image available
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 sm:p-8 lg:p-10">

              {/* Category / Wishlist / Status */}
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600">
                  {service.category}
                </span>

                <div className="flex shrink-0 items-center gap-3">
                  <WishlistButton
                    listingId={service.id.toString()}
                    listingType="service"
                  />

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses}`}
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
              </div>

              {/* Title */}
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                  Service
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                  {service.title}
                </h1>
              </div>

              {/* Price */}
              <p className="mt-4 text-3xl font-bold text-gray-950">
                {service.pricing_type === "Free"
                  ? "Free"
                  : service.price
                    ? `₹${service.price}`
                    : "Contact"}
              </p>

              {service.pricing_type !== "Free" &&
                service.pricing_type && (
                  <p className="mt-1 text-sm text-gray-500">
                    {service.pricing_type}
                  </p>
                )}

              {/* Description */}
              <section className="mt-8 border-t border-gray-200 pt-7">
                <h2 className="text-base font-semibold text-gray-950">
                  Description
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                  {service.description ||
                    "No description available."}
                </p>
              </section>

              {/* Location */}
              <section className="mt-8 border-t border-gray-200 pt-7">
                <h2 className="text-base font-semibold text-gray-950">
                  Location
                </h2>

                <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
                    <MapPin size={17} />
                  </div>

                  <p className="text-sm font-medium text-gray-900">
                    {service.location || "Not specified"}
                  </p>
                </div>
              </section>

              {/* Provider */}
              <section className="mt-8 border-t border-gray-200 pt-7">
                <h2 className="text-base font-semibold text-gray-950">
                  Service Provider
                </h2>

                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">

                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold uppercase text-white">
                      {provider?.name?.charAt(0) ?? "?"}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">
                        Provider
                      </p>

                      {provider ? (
                        <Link
                          href={`/profile/user/${service.user_id}`}
                          className="mt-0.5 block truncate text-sm font-semibold text-gray-950 hover:underline"
                        >
                          {provider.name}
                        </Link>
                      ) : (
                        <p className="mt-0.5 text-sm font-medium text-gray-600">
                          Unknown provider
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-gray-200 pt-4 text-sm text-gray-500">
                    <Calendar size={16} />

                    <span>
                      Posted{" "}
                      {new Date(
                        service.created_at
                      ).toLocaleDateString([], {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </section>

              {/* Message */}
              <div className="mt-8 border-t border-gray-200 pt-7">
                {service.status === "Completed" ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                    <p className="text-sm font-medium text-red-700">
                      This service has been completed and is no longer available.
                    </p>
                  </div>
                ) : (
                  <MessageButton
                    listingId={service.id.toString()}
                    listingType="service"
                    sellerId={service.user_id}
                    buttonText="Message Provider"
                  />
                )}
              </div>

              {/* Owner Actions */}
              <div className="mt-5">
                <ServiceOwnerActions
                  serviceId={service.id}
                  ownerId={service.user_id}
                />
              </div>

              {/* Report */}
              <div className="mt-4">
                <ReportServiceButton
                  serviceId={service.id.toString()}
                />
              </div>

              {/* Privacy */}
              <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
                <User size={14} />
                Provider contact information is kept private.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}