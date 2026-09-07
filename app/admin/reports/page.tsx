import AdminReportActions from "@/component/AdminReportActions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import {
  AlertTriangle,
  Package,
  Wrench,
  Home,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

export default async function AdminReportsPage() {
  const supabase = await createClient();

  // Check logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  // Fetch reports
  const { data: reports, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);

    return (
      <main className="mx-auto max-w-7xl px-8 py-10">
        <h1 className="text-3xl font-bold">Admin Reports</h1>

        <p className="mt-4 text-red-600">
          Failed to load reports.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Admin Panel
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Reports
          </h1>

          <p className="mt-2 text-gray-500">
            Review reports submitted by marketplace users.
          </p>
        </div>

        <Link
          href="/"
          className="rounded-lg border border-gray-300 px-5 py-3 font-semibold transition hover:bg-gray-100"
        >
          Back to Marketplace
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Reports
          </p>

          <p className="mt-2 text-3xl font-bold">
            {reports?.length ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Pending
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {reports?.filter(
              (report) => report.status === "pending"
            ).length ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Resolved
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {reports?.filter(
              (report) => report.status === "resolved"
            ).length ?? 0}
          </p>
        </div>
      </div>

      {/* Reports */}
      <div className="mt-10">
        <div className="mb-5 flex items-center gap-2">
          <AlertTriangle
            size={22}
            className="text-red-500"
          />

          <h2 className="text-2xl font-bold">
            Submitted Reports
          </h2>
        </div>

        {!reports || reports.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-16 text-center">
            <AlertTriangle
              size={50}
              className="mx-auto text-gray-400"
            />

            <h3 className="mt-5 text-xl font-bold">
              No Reports
            </h3>

            <p className="mt-2 text-gray-500">
              There are currently no reports to review.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {reports.map((report) => {
              const isFeedPost =
                report.feed_post_id !== null;

              const isRoommate =
                !isFeedPost &&
                report.roommate_id !== null;

              const isService =
                !isFeedPost &&
                !isRoommate &&
                report.service_id !== null;

              const listingId = isFeedPost
                ? report.feed_post_id
                : isRoommate
                ? report.roommate_id
                : isService
                ? report.service_id
                : report.product_id;

              const listingUrl = isFeedPost
                ? `/feed#post-${listingId}`
                : isRoommate
                ? `/roommates/${listingId}`
                : isService
                ? `/services/${listingId}`
                : `/products/${listingId}`;

              const listingType = isFeedPost
                ? "Feed Post"
                : isRoommate
                ? "Roommate"
                : isService
                ? "Service"
                : "Product";

              return (
                <div
                  key={report.id}
                  className="rounded-2xl border bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    {/* Left */}
                    <div className="flex gap-4">
                      <div className="rounded-xl bg-gray-100 p-3">
                        {isFeedPost ? (
                          <MessageCircle
                            size={24}
                            className="text-blue-600"
                          />
                        ) : isRoommate ? (
                          <Home
                            size={24}
                            className="text-blue-600"
                          />
                        ) : isService ? (
                          <Wrench
                            size={24}
                            className="text-blue-600"
                          />
                        ) : (
                          <Package
                            size={24}
                            className="text-blue-600"
                          />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold">
                            {listingType} Report
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              report.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : report.status === "resolved"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {report.status}
                          </span>
                        </div>

                        <p className="mt-2 text-gray-600">
                          <span className="font-semibold">
                            Reason:
                          </span>{" "}
                          {report.reason}
                        </p>

                        {report.description && (
                          <p className="mt-2 text-gray-500">
                            {report.description}
                          </p>
                        )}

                        <p className="mt-3 text-sm text-gray-400">
                          Report ID: {report.id}
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                          Submitted:{" "}
                          {new Date(
                            report.created_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col gap-3 text-sm text-gray-500">
                      <p>
                        {listingType} ID:{" "}
                        <span className="font-medium text-gray-700">
                          {listingId}
                        </span>
                      </p>

                      <p>
                        Reporter ID:{" "}
                        <span className="font-medium text-gray-700">
                          {report.reporter_id}
                        </span>
                      </p>

                      {/* View Listing / Post */}
                      <Link
                        href={listingUrl}
                        target="_blank"
                        className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                      >
                        <ExternalLink size={16} />

                        View {listingType}
                      </Link>

                      {report.status === "pending" && (
                        <AdminReportActions
                          reportId={report.id}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}