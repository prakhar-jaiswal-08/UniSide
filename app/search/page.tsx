import Link from "next/link";
import ProductCard from "@/component/ProductCard";
import { supabase } from "@/lib/supabase";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  const query = q.trim();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("created_at", { ascending: false });

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .ilike("title", `%${query}%`)
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-2">
        Search Results
      </h1>

      <p className="text-gray-500 mb-10">
        Showing results for{" "}
        <span className="font-semibold text-black">
          "{query}"
        </span>
      </p>

      {/* Products */}
      <section>
        <h2 className="text-2xl font-bold mb-6">
          📦 Products
        </h2>

        {products && products.length > 0 ? (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
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
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center text-gray-400">
            No matching products found.
          </div>
        )}
      </section>

      {/* Services */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">
          🛠️ Services
        </h2>

        {services && services.length > 0 ? (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      service.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : service.status === "Reserved"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {service.status}
                  </span>

                  <span className="text-lg font-bold text-blue-500">
                    ₹{service.price}
                  </span>
                </div>

                <h3 className="mt-5 text-2xl font-bold">
                  {service.title}
                </h3>

                <p className="mt-3 line-clamp-3 text-gray-400">
                  {service.description}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center text-gray-400">
            No matching services found.
          </div>
        )}
      </section>
    </main>
  );
}