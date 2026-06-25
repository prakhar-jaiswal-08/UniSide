import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";

export default function ProductCard({
  id,
  name,
  price,
  image_url,
}: {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border w-80">
      <div className="h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            width={400}
            height={300}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package size={60} className="text-gray-400" />
        )}
      </div>

      <h2 className="text-xl font-semibold text-gray-800 truncate">
        {name}
      </h2>

      <p className="text-2xl font-bold text-green-600 mt-2">
        ₹{price}
      </p>

      <Link href={`/products/${id}`}>
        <button className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
          View Details
        </button>
      </Link>
    </div>
  );
}