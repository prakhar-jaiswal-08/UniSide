import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import {
  ArrowLeft,
  Package,
  Wrench,
  Home,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import AdminListingActions from "@/component/AdminListingActions";

type Listing = {
  id: string;
  title: string;
  type: "Product" | "Service" | "Roommate";
  status: string;
  created_at: string;
  user_id: string | null;
};

export default async function AdminModerationPage() {
  const supabase = await createClient();

  // Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Admin check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  // Products
  const { data: products } = await supabase
    .from("products")
    .select("id, name, status, created_at, user_id")
    .order("created_at", { ascending: false });

  // Services
  const { data: services } = await supabase
    .from("services")
    .select("id, title, status, created_at, user_id")
    .order("created_at", { ascending: false });

  // Roommates
  const { data: roommates } = await supabase
    .from("roommates")
    .select("id, name, status, created_at, user_id")
    .order("created_at", { ascending: false });

  const listings: Listing[] = [
    ...(products ?? []).map((item) => ({
      id: item.id.toString(),
      title: item.name || "Untitled Product",
      type: "Product" as const,
      status: item.status,
      created_at: item.created_at,
      user_id: item.user_id,
    })),

    ...(services ?? []).map((item) => ({
      id: item.id.toString(),
      title: item.title,
      type: "Service" as const,
      status: item.status || "Available",
      created_at: item.created_at,
      user_id: item.user_id,
    })),

    ...(roommates ?? []).map((item) => ({
      id: item.id.toString(),
      title: item.name,
      type: "Roommate" as const,
      status: item.status,
      created_at: item.created_at,
      user_id: item.user_id,
    })),
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );

  return (
    <main className="min-h-screen bg-gray-100 px-5 py-8 font-sans text-gray-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Administration
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-gray-950">
                  Listing Moderation
                </h1>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Review and manage marketplace listings.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm">
            <ShieldCheck size={16} />
            Admin Only
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<Package size={19} />}
            label="Products"
            value={products?.length ?? 0}
          />

          <SummaryCard
            icon={<Wrench size={19} />}
            label="Services"
            value={services?.length ?? 0}
          />

          <SummaryCard
            icon={<Home size={19} />}
            label="Roommates"
            value={roommates?.length ?? 0}
          />
        </div>

        {/* Listings */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-950">
              All Listings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {listings.length} total marketplace listings.
            </p>
          </div>

          {listings.length === 0 ? (
            <div className="p-10 text-center">
              <Package
                size={36}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 text-sm font-medium text-gray-500">
                No listings found.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {listings.map((listing) => (
                <ListingRow
                  key={`${listing.type}-${listing.id}`}
                  listing={listing}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
        {icon}
      </div>

      <p className="mt-4 text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-gray-950">
        {value}
      </p>
    </div>
  );
}

function ListingRow({
  listing,
}: {
  listing: Listing;
}) {
  const Icon =
    listing.type === "Product"
      ? Package
      : listing.type === "Service"
        ? Wrench
        : Home;

  const listingUrl =
    listing.type === "Product"
      ? `/products/${listing.id}`
      : listing.type === "Service"
        ? `/services/${listing.id}`
        : `/roommates/${listing.id}`;

  return (
    <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-950">
            {listing.title}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>{listing.type}</span>

            <span className="text-gray-300">•</span>

            <span>{listing.status}</span>

            <span className="text-gray-300">•</span>

            <span>
              {new Date(listing.created_at).toLocaleDateString([], {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={listingUrl}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <ExternalLink size={14} />
          View
        </Link>

        <AdminListingActions
          listingId={listing.id}
          listingType={listing.type.toLowerCase() as
            | "product"
            | "service"
            | "roommate"}
          listingTitle={listing.title}
        />
      </div>
    </div>
  );
}