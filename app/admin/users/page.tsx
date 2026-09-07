export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import {
  ArrowLeft,
  Search,
  Users,
  Package,
  Wrench,
  Home,
  ShieldCheck,
} from "lucide-react";

type Props = {
  searchParams: Promise<{
    search?: string;
  }>;
};

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  college: string | null;
  department: string | null;
  year: string | null;
  role: string | null;
  created_at: string;
  product_count: number;
  service_count: number;
  roommate_count: number;
};

export default async function AdminUsersPage({
  searchParams,
}: Props) {
  const { search } = await searchParams;
  const searchQuery = search?.trim() ?? "";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const { data, error } = await supabase.rpc("get_admin_users", {
    p_search: searchQuery || null,
  });

  const users: AdminUser[] = (data ?? []) as AdminUser[];

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
                <Users size={22} />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Administration
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-gray-950">
                  User Management
                </h1>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              View registered marketplace users and their activity.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm">
            <ShieldCheck size={16} />
            Admin Only
          </div>
        </div>

        {/* Search */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <form
            action="/admin/users"
            method="GET"
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search by name, email, college or department..."
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <Search size={17} />
              Search
            </button>

            {searchQuery && (
              <Link
                href="/admin/users"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Clear
              </Link>
            )}
          </form>
        </section>

        {/* Results */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-950">
              Users
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {searchQuery
                ? `${users.length} matching user${
                    users.length === 1 ? "" : "s"
                  }`
                : `${users.length} registered user${
                    users.length === 1 ? "" : "s"
                  }`}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              Unable to load users.
            </p>
          </div>
        )}

        {/* Empty */}
        {!error && users.length === 0 && (
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
            <Users
              size={36}
              className="mx-auto text-gray-300"
            />

            <h3 className="mt-4 text-base font-semibold text-gray-950">
              No users found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try a different search term.
            </p>
          </div>
        )}

        {/* Desktop */}
        {!error && users.length > 0 && (
          <>
            <div className="mt-5 hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        College
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Year
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Listings
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Joined
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {users.map((item) => (
                      <UserTableRow
                        key={item.id}
                        user={item}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile / Tablet */}
            <div className="mt-5 grid gap-4 lg:hidden">
              {users.map((item) => (
                <UserCard
                  key={item.id}
                  user={item}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function UserTableRow({
  user,
}: {
  user: AdminUser;
}) {
  const initials =
    user.name?.trim().charAt(0).toUpperCase() ?? "?";

  const totalListings =
    Number(user.product_count ?? 0) +
    Number(user.service_count ?? 0) +
    Number(user.roommate_count ?? 0);

  return (
    <tr className="transition hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold uppercase text-white">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-950">
              {user.name || "Unnamed User"}
            </p>

            <p className="truncate text-xs text-gray-500">
              {user.email || "No email"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-600">
        {user.college || "—"}
      </td>

      <td className="px-6 py-4 text-sm text-gray-600">
        {user.department || "—"}
      </td>

      <td className="px-6 py-4 text-sm text-gray-600">
        {user.year || "—"}
      </td>

      <td className="px-6 py-4">
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
            user.role === "admin"
              ? "border-gray-300 bg-gray-100 text-gray-900"
              : "border-gray-200 bg-white text-gray-600"
          }`}
        >
          {user.role || "user"}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Package size={14} />
            {user.product_count}
          </span>

          <span className="inline-flex items-center gap-1">
            <Wrench size={14} />
            {user.service_count}
          </span>

          <span className="inline-flex items-center gap-1">
            <Home size={14} />
            {user.roommate_count}
          </span>

          <span className="font-semibold text-gray-700">
            {totalListings} total
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-500">
        {formatDate(user.created_at)}
      </td>
    </tr>
  );
}

function UserCard({
  user,
}: {
  user: AdminUser;
}) {
  const initials =
    user.name?.trim().charAt(0).toUpperCase() ?? "?";

  const totalListings =
    Number(user.product_count ?? 0) +
    Number(user.service_count ?? 0) +
    Number(user.roommate_count ?? 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold uppercase text-white">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-950">
              {user.name || "Unnamed User"}
            </p>

            <p className="truncate text-xs text-gray-500">
              {user.email || "No email"}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            user.role === "admin"
              ? "border-gray-300 bg-gray-100 text-gray-900"
              : "border-gray-200 bg-white text-gray-600"
          }`}
        >
          {user.role || "user"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <InfoItem
          label="College"
          value={user.college || "—"}
        />

        <InfoItem
          label="Department"
          value={user.department || "—"}
        />

        <InfoItem
          label="Year"
          value={user.year || "—"}
        />

        <InfoItem
          label="Joined"
          value={formatDate(user.created_at)}
        />
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        <p className="text-xs font-medium text-gray-400">
          Listings
        </p>

        <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <Package size={14} />
            {user.product_count} products
          </span>

          <span className="inline-flex items-center gap-1.5">
            <Wrench size={14} />
            {user.service_count} services
          </span>

          <span className="inline-flex items-center gap-1.5">
            <Home size={14} />
            {user.roommate_count} roommates
          </span>

          <span className="font-semibold text-gray-700">
            {totalListings} total
          </span>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-gray-800">
        {value}
      </p>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}