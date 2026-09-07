import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import {
  Users,
  Package,
  Wrench,
  Home,
  Flag,
  Clock,
  ArrowRight,
  ShieldCheck,
  Settings,
} from "lucide-react";

type DashboardStats = {
  users: number;
  products: number;
  services: number;
  roommates: number;
  reports: number;
  pending_reports: number;
};

type ActivityItem = {
  id: string;
  title: string;
  type: "Product" | "Service" | "Roommate";
  created_at: string;
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  // Get dashboard statistics
  const { data: statsData, error: statsError } = await supabase.rpc(
    "get_admin_dashboard_stats"
  );

  const stats: DashboardStats = statsData ?? {
    users: 0,
    products: 0,
    services: 0,
    roommates: 0,
    reports: 0,
    pending_reports: 0,
  };

  // Get recent products
  const { data: products } = await supabase
    .from("products")
    .select("id, name, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Get recent services
  const { data: services } = await supabase
    .from("services")
    .select("id, title, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Get recent roommate listings
  const { data: roommates } = await supabase
    .from("roommates")
    .select("id, name, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const recentActivity: ActivityItem[] = [
    ...(products ?? []).map((item) => ({
      id: item.id.toString(),
      title: item.name,
      type: "Product" as const,
      created_at: item.created_at,
    })),

    ...(services ?? []).map((item) => ({
      id: item.id.toString(),
      title: item.title,
      type: "Service" as const,
      created_at: item.created_at,
    })),

    ...(roommates ?? []).map((item) => ({
      id: item.id.toString(),
      title: item.name,
      type: "Roommate" as const,
      created_at: item.created_at,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 8);

  return (
    <main className="min-h-screen bg-gray-100 px-5 py-8 font-sans text-gray-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Administration
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-gray-950">
                  Admin Dashboard
                </h1>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Overview of your college marketplace.
            </p>
          </div>
        </div>

        {/* Stats */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<Users size={20} />}
            label="Total Users"
            value={stats.users}
          />

          <StatCard
            icon={<Package size={20} />}
            label="Products"
            value={stats.products}
          />

          <StatCard
            icon={<Wrench size={20} />}
            label="Services"
            value={stats.services}
          />

          <StatCard
            icon={<Home size={20} />}
            label="Roommate Listings"
            value={stats.roommates}
          />

          <StatCard
            icon={<Flag size={20} />}
            label="Total Reports"
            value={stats.reports}
          />

          <StatCard
            icon={<Clock size={20} />}
            label="Pending Reports"
            value={stats.pending_reports}
            highlight={stats.pending_reports > 0}
          />
        </section>

        {/* Admin Management */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <Settings size={19} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-950">
                Admin Management
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage users, listings, and marketplace reports.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">

            {/* User Management */}
            <Link
              href="/admin/user"
              className="group rounded-xl border border-gray-200 bg-gray-50 p-5 transition hover:border-gray-300 hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm">
                  <Users size={18} />
                </div>

                <ArrowRight
                  size={17}
                  className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-900"
                />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-950">
                User Management
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                View registered users and their marketplace activity.
              </p>
            </Link>

            {/* Listing Moderation */}
            <Link
              href="/admin/moderation"
              className="group rounded-xl border border-gray-200 bg-gray-50 p-5 transition hover:border-gray-300 hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm">
                  <ShieldCheck size={18} />
                </div>

                <ArrowRight
                  size={17}
                  className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-900"
                />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-950">
                Listing Moderation
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Review and remove marketplace listings when necessary.
              </p>
            </Link>

            {/* Reports */}
            <Link
              href="/admin/reports"
              className="group rounded-xl border border-gray-200 bg-gray-50 p-5 transition hover:border-gray-300 hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm">
                  <Flag size={18} />
                </div>

                <ArrowRight
                  size={17}
                  className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-900"
                />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-950">
                Manage Reports
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Review pending reports submitted by marketplace users.
              </p>
            </Link>

          </div>
        </section>

        {/* Reports Summary */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-950">
                Report Overview
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Review reports submitted by marketplace users.
              </p>
            </div>

            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:underline"
            >
              Open Reports
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Total reports
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-950">
                {stats.reports}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Awaiting review
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-950">
                {stats.pending_reports}
              </p>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-950">
              Recent Listings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Recently created marketplace listings.
            </p>
          </div>

          {recentActivity.length === 0 ? (
            <div className="p-8 text-center">
              <Package
                size={32}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 text-sm font-medium text-gray-500">
                No listings yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentActivity.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                      {item.type === "Product" && (
                        <Package size={17} />
                      )}

                      {item.type === "Service" && (
                        <Wrench size={17} />
                      )}

                      {item.type === "Roommate" && (
                        <Home size={17} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {item.title}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-500">
                        {item.type}
                      </p>
                    </div>
                  </div>

                  <p className="shrink-0 text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString([], {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {statsError && (
          <p className="mt-4 text-center text-xs text-gray-400">
            Some dashboard statistics could not be loaded.
          </p>
        )}
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>

        {highlight && (
          <span className="rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">
            Needs review
          </span>
        )}
      </div>

      <p className="mt-5 text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold text-gray-950">
        {value}
      </p>
    </div>
  );
}