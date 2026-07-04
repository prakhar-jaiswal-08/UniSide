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

  console.log("Product:", product);
  console.log("Seller:", seller);

  return (
    <main className="max-w-6xl mx-auto px-8 py-10">
      <Link
        href="/"
        className="text-blue-600 hover:underline mb-8 inline-block"
      >
        ← Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-10 bg-white rounded-xl shadow-2xl p-8">

        <div>
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={600}
              height={600}
              className="rounded-xl w-full h-[450px] object-cover"
            />
          ) : (
            <div className="w-full h-[450px] bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 text-xl font-semibold">
              No Image
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            {product.name}
          </h1>

          <p className="text-3xl font-bold text-green-600 mt-4">
            ₹{product.price}
          </p>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900">
              Description
            </h2>

            <p className="mt-3 text-gray-800 leading-7">
              {product.description || "No description available."}
            </p>
          </div>

          <div className="mt-8 border-t border-gray-300 pt-6 space-y-3">
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

          <MessageSellerButton
  productId={product.id}
  sellerId={product.user_id}
/>
        </div>
      </div>
    </main>
  );
}