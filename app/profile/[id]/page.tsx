import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/component/ProductCard";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PublicProfilePage({
  params,
}: Props) {
  const { id } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", id)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, image_url, status, category")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-7xl px-8 py-10">
      <Link
        href="/chat"
        className="mb-8 inline-block text-blue-500 hover:underline"
      >
        ← Back
      </Link>

      <div className="rounded-2xl bg-white p-8 shadow-xl">
        {/* Profile Header */}
        <div className="flex items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-4xl font-bold uppercase text-white">
            {profile?.name?.charAt(0)}
          </div>

          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {profile?.name}
            </h1>

            <p className="mt-2 text-gray-600">
              {profile?.email}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 flex justify-center">
          <div className="w-64 rounded-xl bg-gray-100 p-6 text-center">
            <p className="text-3xl font-bold text-gray-900">
              {products?.length ?? 0}
            </p>

            <p className="mt-2 text-gray-600">
              Listings
            </p>
          </div>
        </div>

        {/* Listings */}
        <h2 className="mt-10 text-2xl font-bold text-gray-900">
          Listings ({products?.length ?? 0})
        </h2>

        <div className="mt-8 flex flex-wrap gap-6">
          {products?.length === 0 && (
            <div className="w-full rounded-xl border border-dashed p-10 text-center text-gray-500">
              This user hasn't listed any products yet.
            </div>
          )}

          {products?.map((product) => (
            <ProductCard
              key={product.id}
              id={String(product.id)}
              name={product.name}
              price={product.price}
              image_url={product.image_url}
              sellerName={profile?.name}
              category={product.category}
              status={product.status}
            />
          ))}
        </div>
      </div>
    </main>
  );
}