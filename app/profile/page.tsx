"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DeleteButton from "@/component/DeleteButton";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  price: number;
};

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setName(profile.name);
      }

      const { data: myProducts } = await supabase
        .from("products")
        .select("id,name,price")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setProducts(myProducts || []);
      setLoading(false);
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-8">
        <h1 className="text-2xl text-gray-900">Loading...</h1>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-8 py-10">
      <div className="bg-white rounded-2xl shadow-xl p-8">

        <h1 className="text-4xl font-bold text-gray-900">
          My Profile
        </h1>

        <div className="mt-8 space-y-3 text-gray-900">
          <p>
            <span className="font-semibold">Name:</span> {name}
          </p>

          <p>
            <span className="font-semibold">Email:</span> {email}
          </p>

          <p>
            <span className="font-semibold">Total Listings:</span>{" "}
            {products.length}
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-5">
          My Products
        </h2>

        {products.length === 0 ? (
          <p className="text-gray-700">
            You haven't listed any products yet.
          </p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-xl p-5 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {product.name}
                  </h3>

                  <p className="text-green-600 font-bold">
                    ₹{product.price}
                  </p>
                </div>

               <div className="flex gap-3">
  <Link
    href={`/products/${product.id}`}
    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
  >
    View
  </Link>

  <Link
    href={`/products/edit/${product.id}`}
    className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg"
  >
    Edit
  </Link>

  <DeleteButton productId={product.id} />
</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}