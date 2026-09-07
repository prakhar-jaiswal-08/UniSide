"use client";

import { supabase } from "@/lib/supabase";
import {
  Package,
  Wrench,
  Home,
  User,
  Mail,
  Pencil,
} from "lucide-react";

import { useEffect, useState } from "react";
import Link from "next/link";
import DeleteButton from "@/component/DeleteButton";
import StatusButton from "@/component/StatusButton";

type Product = {
  id: number;
  name: string;
  price: number;
  status: string;
};

type Service = {
  id: string;
  title: string;
  price: number | null;
  status: string;
};

type Roommate = {
  id: string;
  name: string;
  location: string;
  budget: number;
  room_type: string;
  status: string;
};

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setName(profile.name);
      }

      const { data: myProducts } = await supabase
        .from("products")
        .select("id,name,price,status")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      const { data: myServices } = await supabase
        .from("services")
        .select("id,title,price,status")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      const { data: myRoommates } = await supabase
        .from("roommates")
        .select(
          "id,name,location,budget,room_type,status"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      setProducts(myProducts || []);
      setServices(myServices || []);
      setRoommates(myRoommates || []);

      setLoading(false);
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-gray-500">
              Loading profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  const totalListings =
    products.length +
    services.length +
    roommates.length;

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10 font-sans text-gray-900 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Profile Header */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-950 text-2xl font-semibold uppercase text-white">
                {name?.charAt(0) || "U"}
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Account
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">
                  {name || "My Profile"}
                </h1>

                <div className="mt-2 flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:items-center sm:gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={15} />
                    {email}
                  </span>

                  <span className="hidden text-gray-300 sm:inline">
                    |
                  </span>

                  <span>
                    College Marketplace member
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/profile/edit"
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 hover:text-gray-950"
            >
              <Pencil size={16} />
              Edit Profile
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Package size={20} />}
            value={totalListings}
            label="Total Listings"
          />

          <StatCard
            icon={<Package size={20} />}
            value={products.length}
            label="Products"
          />

          <StatCard
            icon={<Wrench size={20} />}
            value={services.length}
            label="Services"
          />

          <StatCard
            icon={<Home size={20} />}
            value={roommates.length}
            label="Roommates"
          />
        </section>

        {/* Products */}
        <ListingSection
          icon={<Package size={21} />}
          title="My Products"
          count={products.length}
        >
          {products.length === 0 ? (
            <EmptyState message="You haven't listed any products yet." />
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-gray-950">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-base font-semibold text-gray-950">
                      ₹
                      {Number(
                        product.price
                      ).toLocaleString("en-IN")}
                    </p>

                    <StatusBadge
                      status={product.status}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                    >
                      View
                    </Link>

                    <Link
                      href={`/products/edit/${product.id}`}
                      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                      Edit
                    </Link>

                    <StatusButton
                      productId={product.id}
                      currentStatus={product.status}
                    />

                    <DeleteButton
                      productId={product.id}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ListingSection>

        {/* Services */}
        <ListingSection
          icon={<Wrench size={21} />}
          title="My Services"
          count={services.length}
        >
          {services.length === 0 ? (
            <EmptyState message="You haven't listed any services yet." />
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-gray-950">
                      {service.title}
                    </h3>

                    {service.price !== null && (
                      <p className="mt-1 text-base font-semibold text-gray-950">
                        ₹
                        {Number(
                          service.price
                        ).toLocaleString("en-IN")}
                      </p>
                    )}

                    <StatusBadge
                      status={service.status}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/services/${service.id}`}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                    >
                      View
                    </Link>

                    <Link
                      href={`/services/${service.id}/edit`}
                      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ListingSection>

        {/* Roommates */}
        <ListingSection
          icon={<Home size={21} />}
          title="My Roommate Listings"
          count={roommates.length}
        >
          {roommates.length === 0 ? (
            <EmptyState message="You haven't created any roommate listings yet." />
          ) : (
            <div className="space-y-3">
              {roommates.map((roommate) => (
                <div
                  key={roommate.id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-gray-950">
                      {roommate.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {roommate.location}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      ₹
                      {Number(
                        roommate.budget
                      ).toLocaleString("en-IN")}
                      /month
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {roommate.room_type}
                    </p>

                    <StatusBadge
                      status={roommate.status}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/roommates/${roommate.id}`}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                    >
                      View
                    </Link>

                    <Link
                      href={`/roommates/${roommate.id}/edit`}
                      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ListingSection>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
          {icon}
        </div>

        <span className="text-2xl font-bold text-gray-950">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        {label}
      </p>
    </div>
  );
}

function ListingSection({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm ring-1 ring-gray-200">
            {icon}
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-gray-950">
            {title}
          </h2>
        </div>

        <span className="text-sm text-gray-500">
          {count}{" "}
          {count === 1 ? "listing" : "listings"}
        </span>
      </div>

      {children}
    </section>
  );
}

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
      <p className="text-sm text-gray-500">
        {message}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = status.toLowerCase();

  const statusClasses =
    normalized === "available"
      ? "bg-gray-100 text-gray-700"
      : normalized === "reserved"
      ? "bg-gray-100 text-gray-600"
      : normalized === "sold" ||
        normalized === "completed" ||
        normalized === "filled"
      ? "bg-gray-200 text-gray-700"
      : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses}`}
    >
      {status.toUpperCase()}
    </span>
  );
}