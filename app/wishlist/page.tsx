"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Package,
  Wrench,
  Home,
} from "lucide-react";

import ProductCard from "@/component/ProductCard";
import WishlistButton from "@/component/WishlistButton";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  profiles: {
    name: string;
  } | null;
};

type Service = {
  id: number;
  title: string;
  price: number;
  image_url: string | null;
  category: string;
  status: string;
  pricing_type?: string;
};

type Roommate = {
  id: string;
  name: string;
  college: string;
  location: string;
  budget: number;
  room_type: string;
  image_url: string | null;
  status: string;
};

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: wishlist, error: wishlistError } =
      await supabase
        .from("wishlist")
        .select("product_id, service_id, roommate_id")
        .eq("user_id", user.id);

    if (wishlistError) {
      console.error(
        "Wishlist error:",
        wishlistError
      );

      setLoading(false);
      return;
    }

    if (!wishlist || wishlist.length === 0) {
      setProducts([]);
      setServices([]);
      setRoommates([]);
      setLoading(false);
      return;
    }

    const productIds = wishlist
      .map((item) => item.product_id)
      .filter(Boolean);

    const serviceIds = wishlist
      .map((item) => item.service_id)
      .filter(Boolean);

    const roommateIds = wishlist
      .map((item) => item.roommate_id)
      .filter(Boolean);

    /* Products */
    if (productIds.length > 0) {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          profiles (
            name
          )
        `)
        .in("id", productIds);

      if (error) {
        console.error(
          "Products wishlist error:",
          error
        );
      } else {
        setProducts(data || []);
      }
    } else {
      setProducts([]);
    }

    /* Services */
    if (serviceIds.length > 0) {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .in("id", serviceIds);

      if (error) {
        console.error(
          "Services wishlist error:",
          error
        );
      } else {
        setServices(data || []);
      }
    } else {
      setServices([]);
    }

    /* Roommates */
    if (roommateIds.length > 0) {
      const { data, error } = await supabase
        .from("roommates")
        .select("*")
        .in("id", roommateIds);

      if (error) {
        console.error(
          "Roommates wishlist error:",
          error
        );
      } else {
        setRoommates(data || []);
      }
    } else {
      setRoommates([]);
    }

    setLoading(false);
  }

  const totalWishlist =
    products.length +
    services.length +
    roommates.length;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 px-5 py-10 font-sans sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-gray-500">
              Loading wishlist...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-5 py-8 font-sans text-gray-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
            <Heart
              size={23}
              className="text-gray-700"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              My Wishlist
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {totalWishlist === 0
                ? "Save your favorite listings for later."
                : `${totalWishlist} saved ${
                    totalWishlist === 1
                      ? "listing"
                      : "listings"
                  }`}
            </p>
          </div>
        </div>

        {/* Empty */}
        {totalWishlist === 0 && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <Heart
                size={27}
                className="text-gray-400"
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-950">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Start exploring products, services, and
              roommates and save your favorites here.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className="inline-flex h-10 items-center rounded-lg bg-gray-950 px-4 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Browse Products
              </Link>

              <Link
                href="/services"
                className="inline-flex h-10 items-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Browse Services
              </Link>
            </div>
          </div>
        )}

        {/* Products */}
        {products.length > 0 && (
          <section className="mt-10">
            <SectionHeader
              icon={<Package size={19} />}
              title="Products"
              count={products.length}
            />

            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image_url={product.image_url}
                  category={product.category}
                  sellerName={product.profiles?.name}
                />
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {services.length > 0 && (
          <section className="mt-12">
            <SectionHeader
              icon={<Wrench size={19} />}
              title="Services"
              count={services.length}
            />

            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100">
                    {service.image_url ? (
                      <img
                        src={service.image_url}
                        alt={service.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Wrench
                          size={42}
                          className="text-gray-300"
                        />
                      </div>
                    )}

                    <div className="absolute right-3 top-3">
                      <WishlistButton
                        listingId={service.id.toString()}
                        listingType="service"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <Link
                    href={`/services/${service.id}`}
                    className="block p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="truncate text-base font-semibold text-gray-950">
                        {service.title}
                      </h3>

                      <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-600">
                        {service.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      {service.category}
                    </p>

                    <p className="mt-4 text-lg font-bold text-gray-950">
                      {service.pricing_type === "Free"
                        ? "Free"
                        : service.price
                          ? `₹${service.price}`
                          : "Contact"}
                    </p>

                    {service.pricing_type &&
                      service.pricing_type !== "Free" && (
                        <p className="mt-1 text-xs text-gray-400">
                          {service.pricing_type}
                        </p>
                      )}

                    <span className="mt-4 inline-flex text-sm font-medium text-gray-600 group-hover:text-gray-950">
                      View Details
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Roommates */}
        {roommates.length > 0 && (
          <section className="mt-12 pb-8">
            <SectionHeader
              icon={<Home size={19} />}
              title="Roommates"
              count={roommates.length}
            />

            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {roommates.map((roommate) => (
                <div
                  key={roommate.id}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100">
                    {roommate.image_url ? (
                      <img
                        src={roommate.image_url}
                        alt={roommate.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Home
                          size={42}
                          className="text-gray-300"
                        />
                      </div>
                    )}

                    <div className="absolute right-3 top-3">
                      <WishlistButton
                        listingId={roommate.id}
                        listingType="roommate"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <Link
                    href={`/roommates/${roommate.id}`}
                    className="block p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="truncate text-base font-semibold text-gray-950">
                        {roommate.name}
                      </h3>

                      <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium capitalize text-gray-600">
                        {roommate.status}
                      </span>
                    </div>

                    <p className="mt-2 truncate text-sm text-gray-500">
                      {roommate.college}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      {roommate.location}
                    </p>

                    <p className="mt-4 text-lg font-bold text-gray-950">
                      ₹
                      {Number(
                        roommate.budget
                      ).toLocaleString("en-IN")}
                      <span className="text-sm font-medium text-gray-400">
                        /month
                      </span>
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {roommate.room_type}
                    </p>

                    <span className="mt-4 inline-flex text-sm font-medium text-gray-600 group-hover:text-gray-950">
                      View Details
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm">
        {icon}
      </div>

      <h2 className="text-xl font-semibold tracking-tight text-gray-950">
        {title}
      </h2>

      <span className="text-sm text-gray-400">
        {count}
      </span>
    </div>
  );
}