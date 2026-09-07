"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/component/ProductCard";
import { supabase } from "@/lib/supabase";
import { categories } from "@/lib/categories";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  RefreshCw,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  sellerName?: string;
  status?: string;
};

const PRODUCTS_PER_PAGE = 12;

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 px-6 py-10 font-sans lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <p className="text-sm text-gray-500">
                Loading products...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, sortBy]);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError(false);

      const from =
        (currentPage - 1) *
        PRODUCTS_PER_PAGE;

      const to =
        from +
        PRODUCTS_PER_PAGE -
        1;

      let sellerIds: string[] = [];

      if (search.trim()) {
        const {
          data: sellerProfiles,
          error: sellerError,
        } = await supabase
          .from("public_profiles")
          .select("id")
          .ilike("name", `%${search.trim()}%`);

        if (sellerError) {
          console.error(sellerError);

          if (!cancelled) {
            setError(true);
            setProducts([]);
            setTotalProducts(0);
            setLoading(false);
          }

          return;
        }

        sellerIds =
          sellerProfiles?.map(
            (seller) => seller.id
          ) ?? [];
      }

      let query = supabase
        .from("products")
        .select(
          "id,name,price,description,category,image_url,created_at,user_id,status",
          { count: "exact" }
        );

      if (search.trim()) {
        const escapedSearch =
          search
            .trim()
            .replace(/[%_,]/g, (char) => `\\${char}`);

        if (sellerIds.length > 0) {
          query = query.or(
            `name.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%,category.ilike.%${escapedSearch}%,user_id.in.(${sellerIds.join(",")})`
          );
        } else {
          query = query.or(
            `name.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%,category.ilike.%${escapedSearch}%`
          );
        }
      }

      if (selectedCategory !== "All") {
        query = query.eq(
          "category",
          selectedCategory
        );
      }

      switch (sortBy) {
        case "low-high":
          query = query.order("price", {
            ascending: true,
          });
          break;

        case "high-low":
          query = query.order("price", {
            ascending: false,
          });
          break;

        default:
          query = query.order("created_at", {
            ascending: false,
          });
          break;
      }

      const {
        data,
        error: productError,
        count,
      } = await query.range(from, to);

      if (productError) {
        console.error(productError);

        if (!cancelled) {
          setError(true);
          setProducts([]);
          setTotalProducts(0);
          setLoading(false);
        }

        return;
      }

      const productData =
        (data as Product[]) ?? [];

      const userIds = [
        ...new Set(
          productData
            .map(
              (product) => product.user_id
            )
            .filter(Boolean)
        ),
      ];

      let sellerMap =
        new Map<string, string>();

      if (userIds.length > 0) {
        const {
          data: sellers,
          error: sellerError,
        } = await supabase
          .from("public_profiles")
          .select("id,name")
          .in("id", userIds);

        if (sellerError) {
          console.error(sellerError);

          if (!cancelled) {
            setError(true);
            setProducts([]);
            setTotalProducts(0);
            setLoading(false);
          }

          return;
        }

        sellerMap = new Map(
          (sellers ?? []).map(
            (seller) => [
              seller.id,
              seller.name ?? "Unknown",
            ]
          )
        );
      }

      const productsWithSellers =
        productData.map((product) => ({
          ...product,
          sellerName:
            sellerMap.get(
              product.user_id
            ) ?? "Unknown",
        }));

      if (!cancelled) {
        setProducts(productsWithSellers);
        setTotalProducts(count ?? 0);
        setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [
    search,
    selectedCategory,
    sortBy,
    currentPage,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalProducts /
        PRODUCTS_PER_PAGE
    )
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-10 font-sans lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <p className="text-sm text-gray-500">
              Loading products...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-10 font-sans lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
            <CircleAlert
              size={32}
              className="mx-auto text-gray-500"
            />

            <h1 className="mt-4 text-lg font-semibold text-gray-900">
              Unable to load products
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Something went wrong while loading the marketplace.
              Please try again.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <RefreshCw size={17} />
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
              Marketplace
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-950">
              Latest listings
            </h1>

            <p className="mt-2 text-gray-500">
              Buy and sell items within your college.
            </p>

            {search && (
              <p className="mt-3 text-sm text-gray-500">
                Showing results for{" "}
                <span className="font-semibold text-gray-900">
                  "{search}"
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label
                htmlFor="category"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Category
              </label>

              <select
                id="category"
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value
                  )
                }
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              >
                <option value="All">
                  All
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="sort"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Sort By
              </label>

              <select
                id="sort"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
                }
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              >
                <option value="newest">
                  Newest
                </option>

                <option value="low-high">
                  Price: Low → High
                </option>

                <option value="high-low">
                  Price: High → Low
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {totalProducts}{" "}
            {totalProducts === 1
              ? "listing"
              : "listings"}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No products found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Try changing your search or category filter.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image_url={
                      product.image_url
                    }
                    sellerName={
                      product.sellerName
                    }
                    category={
                      product.category
                    }
                    status={
                      product.status
                    }
                  />
                )
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">

                {currentPage > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          page - 1
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <ChevronLeft
                      size={17}
                    />
                    Previous
                  </button>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400">
                    <ChevronLeft
                      size={17}
                    />
                    Previous
                  </span>
                )}

                <span className="px-3 text-sm text-gray-500">
                  Page {currentPage} of{" "}
                  {totalPages}
                </span>

                {currentPage <
                totalPages ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          page + 1
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Next
                    <ChevronRight
                      size={17}
                    />
                  </button>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400">
                    Next
                    <ChevronRight
                      size={17}
                    />
                    Next
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}