import ProductCard from "../component/ProductCard";
const products = [
  { name: "Used Laptop", price: 25000 },
  { name: "Engineering Books", price: 500 },
  { name: "Calculator", price: 300 },
];

export default function Home() {
  return (
    <main>
      <h1>College Marketplace</h1>

      {products.map((product) => (
        <ProductCard
          key={product.name}
          name={product.name}
          price={product.price}
        />
      ))}
    </main>
  );
}