"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import SidePanel from "./SidePanel";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsLoggedIn(!!session);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push("/");
  }

  async function handleSearch(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key !== "Enter") return;

    const query = search.trim();

    if (!query || searching) return;

    setSearching(true);

    try {
      const { data: products, error: productError } =
        await supabase
          .from("products")
          .select("id")
          .or(
            `name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`
          )
          .limit(1);

      const { data: services, error: serviceError } =
        await supabase
          .from("services")
          .select("id")
          .or(
            `title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`
          )
          .limit(1);

      if (productError) {
        console.error(
          "Product search error:",
          productError
        );
      }

      if (serviceError) {
        console.error(
          "Service search error:",
          serviceError
        );
      }

      const hasProducts =
        !productError && (products?.length ?? 0) > 0;

      const hasServices =
        !serviceError && (services?.length ?? 0) > 0;

      if (hasProducts && !hasServices) {
        router.push(
          `/products?search=${encodeURIComponent(query)}`
        );
        return;
      }

      if (hasServices && !hasProducts) {
        router.push(
          `/services?search=${encodeURIComponent(query)}`
        );
        return;
      }

      router.push(
        `/search?q=${encodeURIComponent(query)}`
      );
    } catch (error) {
      console.error("Search failed:", error);

      router.push(
        `/search?q=${encodeURIComponent(query)}`
      );
    } finally {
      setSearching(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-300 bg-gray-100">
        <div className="mx-auto flex h-[86px] max-w-[1600px] items-center justify-between px-5 lg:px-8">

          {/* Logo */}
          <Link
  href="/"
  className="flex h-14 w-[190px] shrink-0 items-center overflow-hidden"
>
  <Image
    src="/uniside-logo.png"
    alt="Uniside"
    width={190}
    height={190}
    priority
    className="h-[190px] w-[190px] max-w-none object-cover object-center"
  />
</Link>

          {/* Search */}
          <div className="mx-6 hidden max-w-xl flex-1 lg:block">
            <div className="flex h-11 items-center rounded-full border border-gray-300 bg-white px-4 transition focus-within:border-gray-500 focus-within:ring-2 focus-within:ring-gray-200">
              <Search
                size={18}
                className="mr-3 shrink-0 text-gray-500"
              />

              <input
                type="text"
                placeholder="Search products, services, roommates..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={handleSearch}
                disabled={searching}
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500"
              />

              {searching && (
                <span className="ml-2 shrink-0 text-xs text-gray-400">
                  Searching...
                </span>
              )}
            </div>
          </div>

          {/* Floating Navigation */}
          <nav className="hidden rounded-full border border-gray-800 bg-gray-950 p-1.5 shadow-sm xl:flex">

            <FloatingNavLink href="/">
              Home
            </FloatingNavLink>

            <FloatingNavLink href="/products">
              Products
            </FloatingNavLink>

            <FloatingNavLink href="/services">
              Services
            </FloatingNavLink>

            <FloatingNavLink href="/feed">
              Feed
            </FloatingNavLink>

            <FloatingNavLink href="/roommates">
              Roommates
            </FloatingNavLink>

            <FloatingNavLink href="/sell">
              Sell
            </FloatingNavLink>

            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => setSidePanelOpen(true)}
                aria-label="Open account menu"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-950 transition hover:bg-gray-200"
              >
                <User size={18} />
              </button>
            ) : (
              <Link
                href="/login"
                className="ml-1 flex h-10 items-center rounded-full bg-white px-4 text-sm font-medium text-gray-950 transition hover:bg-gray-200"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              type="button"
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700"
            >
              <Search size={19} />
            </button>

            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => setSidePanelOpen(true)}
                aria-label="Open account menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700"
              >
                <User size={19} />
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-gray-950 px-4 py-2 text-sm font-medium text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex gap-1 overflow-x-auto border-t border-gray-200 px-4 py-2 xl:hidden">

          <MobileNavLink href="/">
            Home
          </MobileNavLink>

          <MobileNavLink href="/products">
            Products
          </MobileNavLink>

          <MobileNavLink href="/services">
            Services
          </MobileNavLink>

          <MobileNavLink href="/feed">
            Feed
          </MobileNavLink>

          <MobileNavLink href="/roommates">
            Roommates
          </MobileNavLink>

          <MobileNavLink href="/sell">
            Sell
          </MobileNavLink>
        </div>
      </header>

      {isLoggedIn && (
        <SidePanel
          open={sidePanelOpen}
          onClose={() => setSidePanelOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

function FloatingNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-full px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="shrink-0 rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-200 hover:text-gray-950"
    >
      {children}
    </Link>
  );
}