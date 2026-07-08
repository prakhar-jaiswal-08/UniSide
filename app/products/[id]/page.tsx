import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MessageSellerButton from "@/component/MessageSellerButton";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    return (
      <main className="max-w-4xl mx-auto p-10">
        <h1 className="text-3xl font-bold text-red-500">
          Product not found
        </h1>
      </main>
    );
  }

  const { data: seller } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", product.user_id)
    .single();


 return (
  <>
    

    <main className="max-w-6xl mx-auto px-8 py-10">
      <Link
        href="/"
        className="mb-8 inline-block text-blue-600 hover:underline"
      >
        ← Back to Products
      </Link>

      <div className="grid gap-10 rounded-xl bg-white p-8 shadow-2xl md:grid-cols-2">

        <div>
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={600}
              height={600}
              className="h-[450px] w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-[450px] w-full items-center justify-center rounded-xl bg-gray-200 text-xl font-semibold text-gray-700">
              No Image
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font-bold text-green-600">
            ₹{product.price}
          </p>
          

          {/* Product Status */}
          <p
            className={`mt-4 inline-block rounded-full px-4 py-2 text-sm font-semibold ${
              product.status === "available"
                ? "bg-green-100 text-green-700"
                : product.status === "reserved"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {product.status.toUpperCase()}
          </p>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900">
              Description
            </h2>

            <p className="mt-3 leading-7 text-gray-800">
              {product.description || "No description available."}
            </p>
          </div>

          <div className="mt-8 space-y-3 border-t border-gray-300 pt-6">
            <h2 className="text-xl font-bold text-gray-900">
              Seller Information
            </h2>

            <p className="text-gray-900">
              <span className="font-semibold">Name:</span>{" "}
              {seller?.name ?? "Unknown"}
            </p>

            <p className="text-gray-900">
              <span className="font-semibold">Email:</span>{" "}
              {seller?.email ?? "Not Available"}
            </p>

            <p className="text-gray-900">
              <span className="font-semibold">Posted:</span>{" "}
              {new Date(product.created_at).toLocaleDateString()}
            </p>
          </div>

          {product.status === "sold" ? (
            <button
              disabled
              className="mt-8 w-full cursor-not-allowed rounded-lg bg-gray-400 py-3 text-lg font-semibold text-white"
            >
              Product Sold
            </button>
          ) : (
            <MessageSellerButton
              productId={product.id}
              sellerId={product.user_id}
            />
          )}
        </div>

      </div>
    </main>
  </>
  );
}