import ProductCard from "../component/ProductCard";
import { supabase } from "../lib/supabase";

export default async function Home() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

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
    <main className="max-w-7xl mx-auto px-8 py-8">
      <h1 className="text-4xl font-bold mb-2">
        Browse Products
      </h1>

      <p className="text-gray-500 mb-8">
        Buy and sell items within your college.
      </p>

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
    </main>
  );
}