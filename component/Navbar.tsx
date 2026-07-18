"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Search,
  ShoppingBag,
  User,
  Heart,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("all");

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-zinc-800 bg-black">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 text-2xl font-bold text-white"
      >
        <ShoppingBag size={28} />
        College Marketplace
      </Link>

      {/* Search */}
      <div className="flex items-center w-[500px] border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900">
        <div className="relative">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="appearance-none bg-zinc-900 text-white h-full pl-4 pr-10 py-3 outline-none border-r border-zinc-700 cursor-pointer"
          >
            <option value="all">All</option>
            <option value="products">Products</option>
            <option value="services">Services</option>
            <option value="roommates">Roommates</option>
          </select>

          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        <div className="flex items-center flex-1 px-3">
          <Search size={18} className="text-gray-400 mr-2" />

          <input
            type="text"
            placeholder="Search products, services, roommates, and more..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || !search.trim()) return;

              const query = encodeURIComponent(search.trim());

              switch (searchType) {
                case "products":
                  router.push(`/products?search=${query}`);
                  break;

                case "services":
                  router.push(`/services?search=${query}`);
                  break;

                case "roommates":
                  router.push(`/roommates?search=${query}`);
                  break;

                default:
                  router.push(`/search?q=${query}`);
              }
            }}
            className="w-full bg-transparent outline-none text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6 text-white">
        <Link href="/products">Products</Link>

        <Link href="/sell">Sell</Link>

        {isLoggedIn ? (
          <>
            <Link
              href="/wishlist"
              className="flex items-center gap-2 hover:text-red-400 transition"
            >
              <Heart size={20} />
              Wishlist
            </Link>

            <Link href="/chat">Chats</Link>

            <Link href="/profile">
              <User />
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>

            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}