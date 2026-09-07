import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CalendarDays,
  IndianRupee,
  MapPin,
  Users,
  User,
  Home,
} from "lucide-react";

import { createClient } from "@/lib/supabase-server";
import BackButton from "@/component/navigation/BackButton";
import MessageButton from "@/component/MessageButton";
import ReportRoommateButton from "@/component/ReportRoommateButton";
import RoommateOwnerActions from "@/component/RoommateOwnerActions";
import WishlistButton from "@/component/WishlistButton";

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

  const { data: roommate } = await supabase
    .from("roommates")
    .select(
      "name,college,location,room_type,budget,description,image_url"
    )
    .eq("id", id)
    .maybeSingle();

  if (!roommate) {
    return {
      title: "Roommate Listing Not Found",
      description:
        "This roommate listing is no longer available on Uniside.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    roommate.description?.trim()
      ? roommate.description.trim().slice(0, 160)
      : `Find a roommate near ${roommate.college} on Uniside.`;

  return {
    title: `Roommate in ${roommate.college}`,
    description,
    openGraph: {
      type: "website",
      title: `Roommate in ${roommate.college} | Uniside`,
      description,
      url: `/roommates/${id}`,
      ...(roommate.image_url
        ? {
            images: [
              {
                url: roommate.image_url,
                width: 1200,
                height: 800,
                alt: roommate.name,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: roommate.image_url
        ? "summary_large_image"
        : "summary",
      title: `Roommate in ${roommate.college} | Uniside`,
      description,
      ...(roommate.image_url
        ? { images: [roommate.image_url] }
        : {}),
    },
    alternates: {
      canonical: `/roommates/${id}`,
    },
    keywords: [
      roommate.name,
      roommate.college,
      roommate.location,
      roommate.room_type,
      "roommate",
      "student roommate",
      "college roommate",
      "Uniside",
    ].filter(Boolean),
  };
}

export default async function RoommateDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: roommate, error } = await supabase
    .from("roommates")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !roommate) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("public_profiles")
    .select("id, name")
    .eq("id", roommate.user_id)
    .single();

  const statusClasses =
    roommate.status === "available"
      ? "border-green-200 bg-green-50 text-green-700"
      : roommate.status === "filled"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-yellow-200 bg-yellow-50 text-yellow-700";

  const statusLabel =
    roommate.status === "available"
      ? "Available"
      : roommate.status === "filled"
        ? "Filled"
        : "Unavailable";

  const providerName =
    profile?.name || roommate.name;

  return (
    <main className="min-h-screen bg-gray-100 px-5 py-8 font-sans text-gray-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">

        <BackButton
          fallback="/roommates"
          label="Back to Roommates"
        />

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid md:grid-cols-2">

            <div className="border-b border-gray-200 bg-gray-50 md:border-b-0 md:border-r">
              {roommate.image_url ? (
                <div className="relative h-[360px] w-full sm:h-[450px] md:h-full md:min-h-[600px]">
                  <Image
                    src={roommate.image_url}
                    alt={roommate.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-[360px] w-full items-center justify-center bg-gray-100 sm:h-[450px] md:h-full md:min-h-[600px]">
                  <div className="text-center">
                    <Users
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

            <div className="p-6 sm:p-8 lg:p-10">

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                    Roommate Listing
                  </p>

                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                    {roommate.name}
                  </h1>

                  <p className="mt-2 text-sm text-gray-500">
                    {roommate.college}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <WishlistButton
                    listingId={roommate.id}
                    listingType="roommate"
                  />

                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses}`}
                  >
                    {statusLabel}
                  </span>
                </div>
              </div>

              <section className="mt-8 border-t border-gray-200 pt-7">
                <h2 className="text-base font-semibold text-gray-950">
                  Accommodation Details
                </h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">

                  <InfoItem
                    icon={<MapPin size={17} />}
                    label="Location"
                    value={roommate.location}
                  />

                  <InfoItem
                    icon={<IndianRupee size={17} />}
                    label="Monthly Budget"
                    value={`₹${Number(
                      roommate.budget
                    ).toLocaleString("en-IN")}`}
                  />

                  <InfoItem
                    icon={<Home size={17} />}
                    label="Room Type"
                    value={roommate.room_type}
                  />

                  {roommate.move_in_date && (
                    <InfoItem
                      icon={<CalendarDays size={17} />}
                      label="Move-in Date"
                      value={new Date(
                        roommate.move_in_date
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    />
                  )}
                </div>
              </section>

              {roommate.gender_preference && (
                <section className="mt-8 border-t border-gray-200 pt-7">
                  <h2 className="text-base font-semibold text-gray-950">
                    Roommate Preference
                  </h2>

                  <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">
                      {roommate.gender_preference}
                    </p>
                  </div>
                </section>
              )}

              {roommate.preferences && (
                <section className="mt-8 border-t border-gray-200 pt-7">
                  <h2 className="text-base font-semibold text-gray-950">
                    Preferences
                  </h2>

                  <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                      {roommate.preferences}
                    </p>
                  </div>
                </section>
              )}

              {roommate.description && (
                <section className="mt-8 border-t border-gray-200 pt-7">
                  <h2 className="text-base font-semibold text-gray-950">
                    About the Listing
                  </h2>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                    {roommate.description}
                  </p>
                </section>
              )}

              <section className="mt-8 border-t border-gray-200 pt-7">
                <h2 className="text-base font-semibold text-gray-950">
                  Listed By
                </h2>

                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold uppercase text-white">
                      {providerName.charAt(0)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">
                        Marketplace member
                      </p>

                      <Link
                        href={`/profile/user/${roommate.user_id}`}
                        className="mt-0.5 block truncate text-sm font-semibold text-gray-950 hover:underline"
                      >
                        {providerName}
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              <div className="mt-8 border-t border-gray-200 pt-7">

                {roommate.status === "available" ? (
                  <MessageButton
                    sellerId={roommate.user_id}
                    listingId={roommate.id}
                    listingType="roommate"
                  />
                ) : (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                    <p className="text-sm font-medium text-gray-500">
                      This roommate listing is no longer available.
                    </p>
                  </div>
                )}

                <div className="mt-4">
                  <RoommateOwnerActions
                    roommateId={roommate.id}
                    ownerId={roommate.user_id}
                  />
                </div>

                <div className="mt-4">
                  <ReportRoommateButton
                    roommateId={roommate.id}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
                <User size={14} />
                Contact information is kept private.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[70px] items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-medium text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}