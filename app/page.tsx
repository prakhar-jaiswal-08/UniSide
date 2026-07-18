import ProductCard from "../component/ProductCard";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default async function Home() {
 const { data: products, error } = await supabase
  .from("products")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(3);

  if (error) {
    return (
      <main className="p-10">
        <h1 className="text-red-500 text-xl">
          Error: {error.message}
        </h1>
      </main>
    );
  }

  
    return (
  <main className="max-w-7xl mx-auto px-6 py-8">

    {/* Hero Section */}
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-10 py-20 text-white">

      {/* Background Glow */}
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-400/30 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-pink-400/30 blur-3xl" />

      <div className="relative z-10 max-w-3xl">

        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-blue-200">
          Welcome to
        </p>

        <h1 className="text-6xl font-extrabold">
          CampusHub
        </h1>

        <p className="mt-6 text-xl leading-8 text-blue-100">
          Buy, sell, offer services and find roommates —
          exclusively within your college community.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">

          <Link
            href="/products"
            className="rounded-xl bg-white px-8 py-4 font-semibold text-blue-700 transition hover:scale-105"
          >
            Browse Marketplace
          </Link>

          <Link
            href="/sell"
            className="rounded-xl border border-white/30 bg-white/10 px-8 py-4 font-semibold backdrop-blur-md transition hover:bg-white/20"
          >
            Sell an Item
          </Link>

        </div>

      </div>

    </section>

    {/* Latest Listings */}
    <section className="mt-16">

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h2 className="text-4xl font-bold">
            Latest Listings
          </h2>

          <p className="mt-2 text-gray-500">
            Recently added products from students.
          </p>
        </div>

        <Link
          href="/products"
          className="font-semibold text-blue-600 hover:underline"
        >
          View All →
        </Link>

      </div>

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            image_url={product.image_url}
            status={product.status}
          />
        ))}
      </div>

    </section>
    {/* Explore */}
<section className="mt-20">

  <div className="mb-10 text-center">

    <h2 className="text-4xl font-bold text-gray-900">
      Explore CampusHub
    </h2>

    <p className="mt-3 text-lg text-gray-500">
      Everything students need, all in one place.
    </p>

  </div>

  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

    <Link
      href="/products"
      className="group rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    >
      <div className="text-5xl">🛍️</div>

      <h3 className="mt-6 text-2xl font-bold">
        Marketplace
      </h3>

      <p className="mt-3 text-gray-500">
        Buy and sell products with verified students.
      </p>

    </Link>

    <Link
      href="/services"
      className="group rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    >
      <div className="text-5xl">🛠️</div>

      <h3 className="mt-6 text-2xl font-bold">
        Services
      </h3>

      <p className="mt-3 text-gray-500">
        Find tutors, designers, developers and more.
      </p>

    </Link>

    <Link
      href="/roommates"
      className="group rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    >
      <div className="text-5xl">🏠</div>

      <h3 className="mt-6 text-2xl font-bold">
        Roommates
      </h3>

      <p className="mt-3 text-gray-500">
        Discover roommates near your college.
      </p>

    </Link>

    <Link
      href="/lost-found"
      className="group rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    >
      <div className="text-5xl">📢</div>

      <h3 className="mt-6 text-2xl font-bold">
        Lost & Found
      </h3>

      <p className="mt-3 text-gray-500">
        Recover lost belongings across campus.
      </p>

    </Link>

  </div>

</section>

  </main>
);
}