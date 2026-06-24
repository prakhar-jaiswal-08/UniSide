export default function ProductCard({
  name,
  price,
}: {
  name: string;
  price: number;
}) {
  return (
    <div>
      <h2>{name}</h2>
      <p>₹{price}</p>
      <button>View Details</button>
    </div>
  );
}