"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Search, ShoppingBag, User } from "lucide-react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
    <nav className="flex items-center justify-between px-8 py-4 border-b shadow-sm">
      <Link
        href="/"
        className="flex items-center gap-2 text-2xl font-bold"
      >
        <ShoppingBag size={28} />
        College Marketplace
      </Link>

      <div className="flex items-center gap-3 border rounded-lg px-3 py-2 w-96">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full outline-none"
        />
      </div>

      <div className="flex items-center gap-6">
        <Link href="/products">Products</Link>
        <Link href="/sell">Sell</Link>

        {isLoggedIn ? (
          <>
            <Link href="/profile">
              <User />
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}