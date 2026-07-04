import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export default async function MyListingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-6xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-bold mb-8">My Listings</h1>

      {error && (
        <p className="text-red-500 mb-4">{error.message}</p>
      )}

      {!products || products.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-600 text-lg">
            You haven't listed any products yet.
          </p>

          <Link
            href="/sell"
            className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Sell Something
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow p-5 flex justify-between items-center"
            >
              <div>
                <h2 className="text-2xl font-semibold">
                  {product.name}
                </h2>

                <p className="text-green-600 font-bold mt-1">
                  ₹{product.price}
                </p>
              </div>

              <Link
                href={`/products/${product.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}