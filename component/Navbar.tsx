"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Search, ShoppingBag, User, Heart } from "lucide-react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [search, setSearch] = useState("");

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
      <Link
        href="/"
        className="flex items-center gap-2 text-2xl font-bold text-white"
      >
        <ShoppingBag size={28} />
        College Marketplace
      </Link>

      <div className="flex items-center gap-3 border border-zinc-700 rounded-lg px-3 py-2 w-96 bg-zinc-900">
        <Search size={18} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value);
            router.push(`/products?search=${encodeURIComponent(value)}`);
          }}
          className="w-full outline-none bg-transparent text-white placeholder:text-gray-500"
        />
      </div>

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
            <Link href="/chat">
  Chats
</Link>

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