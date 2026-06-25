import { supabase } from "@/lib/supabase";

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
  .select(`
    *,
    user_id
  `)
  .eq("id", id)
  .single();

  if (error || !product) {
    return <h1>Product not found</h1>;
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>₹{product.price}</p>
      <p>{product.description}</p>
      <p>Seller ID: {product.user_id}</p>
    </div>
  );
}