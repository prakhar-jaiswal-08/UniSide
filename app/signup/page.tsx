"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

import Button from "@/component/ui/Button";
import Input from "@/component/ui/Input";
import Card from "@/component/ui/Card";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Account created successfully!");
    router.push("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-4 py-10">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center text-white">
          Create Account
        </h1>

        <p className="text-center text-gray-400 mt-2 mb-8">
          Join the College Marketplace
        </p>

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-white mb-2">
              Full Name
            </label>

            <Input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-white mb-2">
              Email
            </label>

            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-white mb-2">
              Password
            </label>

            <Input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-500 hover:text-blue-400 font-semibold"
          >
            Login
          </Link>
        </p>
      </Card>
    </main>
  );
}