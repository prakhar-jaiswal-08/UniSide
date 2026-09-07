import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import MessageButton from "@/component/MessageButton";
import ProductMenu from "@/component/ProductMenu";
import BackButton from "@/component/navigation/BackButton";
import ProductImageGallery from "@/component/ProductImageGallery";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  status: string;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  const { data: product } = await supabase
    .from("products")
    .select(
      "name,description,category,price,image_url"
    )
    .eq("id", id)
    .maybeSingle();

  if (!product) {
    return {
      title: "Product Not Found",
      description:
        "This product is no longer available on Uniside.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    product.description?.trim()
      ? product.description.trim().slice(0, 160)
      : `Buy ${product.name} on Uniside, the college marketplace for students.`;

  return {
    title: product.name,
    description,

    openGraph: {
      type: "website",
      title: `${product.name} | Uniside`,
      description,
      url: `/products/${id}`,
      ...(product.image_url
        ? {
            images: [
              {
                url: product.image_url,
                width: 1200,
                height: 800,
                alt: product.name,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: product.image_url
        ? "summary_large_image"
        : "summary",
      title: `${product.name} | Uniside`,
      description,
      ...(product.image_url
        ? {
            images: [product.image_url],
          }
        : {}),
    },

    alternates: {
      canonical: `/products/${id}`,
    },

    keywords: [
      product.name,
      product.category,
      "college marketplace",
      "student marketplace",
      "Uniside",
    ],
  };
}

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
      <main className="min-h-screen bg-gray-100 px-6 py-10 font-sans">
        <div className="mx-auto max-w-4xl">
          <BackButton
            fallback="/products"
            label="Back to Products"
          />

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
              <span className="text-xl">?</span>
            </div>

            <h1 className="mt-4 text-xl font-semibold text-gray-950">
              Product not found
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              This product may no longer be available.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { data: additionalImages } = await supabase
    .from("product_images")
    .select("image_url,display_order")
    .eq("product_id", product.id)
    .order("display_order", { ascending: true });

  const productImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...(additionalImages?.map(
      (image) => image.image_url
    ) ?? []),
  ];

  const { data: seller } = await supabase
    .from("public_profiles")
    .select("id, name")
    .eq("id", product.user_id)
    .single();

  const statusLabel =
    product.status === "available"
      ? "Available"
      : product.status === "reserved"
        ? "Reserved"
        : "Sold";

  const statusClasses =
    product.status === "available"
      ? "bg-green-50 text-green-700 border-green-200"
      : product.status === "reserved"
        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
        : "bg-red-50 text-red-700 border-red-200";

  return (
    <main className="min-h-screen bg-gray-100 px-5 py-8 font-sans text-gray-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <BackButton
          fallback="/products"
          label="Back to Products"
        />

        {/* Product */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid md:grid-cols-2">

            {/* Image Gallery */}
            <div className="border-b border-gray-200 bg-gray-50 md:border-b-0 md:border-r">
              <ProductImageGallery
                images={productImages}
                productName={product.name}
              />
            </div>

            {/* Details */}
            <div className="p-6 sm:p-8 lg:p-10">

              {/* Title + Menu */}
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                    Product
                  </p>

                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                    {product.name}
                  </h1>

                  <p className="mt-4 text-3xl font-bold text-gray-950">
                    ₹{product.price}
                  </p>
                </div>

                <ProductMenu
                  productId={product.id}
                  sellerId={product.user_id}
                />
              </div>

              {/* Status */}
              <div className="mt-5">
                <span
                  className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses}`}
                >
                  {statusLabel}
                </span>
              </div>

              {/* Description */}
              <section className="mt-8 border-t border-gray-200 pt-7">
                <h2 className="text-base font-semibold text-gray-950">
                  Description
                </h2>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                  {product.description ||
                    "No description available."}
                </p>
              </section>

              {/* Seller */}
              <section className="mt-8 border-t border-gray-200 pt-7">
                <h2 className="text-base font-semibold text-gray-950">
                  Seller Information
                </h2>

                <div className="mt-4 space-y-3">

                  {/* Seller */}
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold uppercase text-white">
                      {seller?.name?.charAt(0) ?? "?"}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">
                        Seller
                      </p>

                      {seller ? (
                        <Link
                          href={`/profile/user/${product.user_id}`}
                          className="mt-0.5 block truncate text-sm font-semibold text-gray-950 hover:underline"
                        >
                          {seller.name}
                        </Link>
                      ) : (
                        <p className="mt-0.5 text-sm font-medium text-gray-600">
                          Unknown seller
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Posted */}
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
                      <Calendar size={17} />
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Posted
                      </p>

                      <p className="mt-0.5 text-sm font-medium text-gray-900">
                        {new Date(
                          product.created_at
                        ).toLocaleDateString([], {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Action */}
              <div className="mt-8 border-t border-gray-200 pt-7">
                {product.status === "sold" ? (
                  <button
                    disabled
                    className="flex h-11 w-full cursor-not-allowed items-center justify-center rounded-lg bg-gray-200 text-sm font-medium text-gray-500"
                  >
                    Product Sold
                  </button>
                ) : (
                  <MessageButton
                    listingId={product.id.toString()}
                    listingType="product"
                    sellerId={product.user_id}
                    buttonText="Message Seller"
                  />
                )}
              </div>

              {/* Privacy */}
              <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
                <User size={14} />
                Seller contact information is kept private.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}