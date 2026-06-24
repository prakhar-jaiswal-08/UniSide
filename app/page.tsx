import ProductCard from "../component/ProductCard";
import { supabase } from "../lib/supabase";

export default async function Home() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <main>
      <h1>College Marketplace</h1>

      {products?.map((product) => (
        <ProductCard
          key={product.id}
          name={product.name}
          price={product.price}
        />
      ))}
    </main>
  );
}