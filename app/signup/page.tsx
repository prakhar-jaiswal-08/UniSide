"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Calendar,
  GraduationCap,
  Building2,
  Phone,
  UserRound,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const ALLOWED_COLLEGE_DOMAINS = ["ggits.net"];

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCollege = college.trim();
    const trimmedDepartment = department.trim();
    const trimmedMobile = mobileNumber.trim();

    if (!trimmedName) {
      toast.error("Please enter your name.");
      return;
    }

    if (!trimmedEmail) {
      toast.error("Please enter your college email.");
      return;
    }

    // Check college email domain
    const emailParts = trimmedEmail.split("@");
    const emailDomain =
      emailParts.length === 2
        ? emailParts[1].toLowerCase()
        : "";

    if (
      emailParts.length !== 2 ||
      !ALLOWED_COLLEGE_DOMAINS.includes(emailDomain)
    ) {
      toast.error(
        "Please use your college email ID (@ggits.net)."
      );
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (!age || Number(age) < 1 || Number(age) > 100) {
      toast.error("Please enter a valid age.");
      return;
    }

    if (!trimmedCollege) {
      toast.error("Please enter your college.");
      return;
    }

    if (!trimmedDepartment) {
      toast.error("Please enter your department.");
      return;
    }

    if (!year) {
      toast.error("Please select your year.");
      return;
    }

    if (!/^[0-9]{10}$/.test(trimmedMobile)) {
      toast.error("Mobile number must contain 10 digits.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: "https://uniside.in/auth/callback",
          data: {
            name: trimmedName,
            age: Number(age),
            college: trimmedCollege,
            department: trimmedDepartment,
            year,
            mobile_number: trimmedMobile,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      /*
       * When Supabase email confirmation is enabled,
       * signup succeeds without creating an active session.
       */
      if (!data.session) {
        toast.success(
          "Account created. Please check your college email to verify your account."
        );

        router.push("/login");
        return;
      }

      /*
       * Fallback in case email confirmation is disabled.
       */
      toast.success("Account created successfully!");
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 font-sans text-gray-900">
      <div className="mx-auto w-full max-w-2xl">

        {/* Header */}
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-950 text-white shadow-sm">
            <UserRound size={22} />
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-950">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Join the College Marketplace
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSignup}>

            {/* Personal Information */}
            <section>
              <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <User size={18} />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-gray-950">
                    Personal Information
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Tell us a little about yourself.
                  </p>
                </div>
              </div>

              {/* Name */}
              <div className="mt-5">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    maxLength={50}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>

              {/* College Email */}
              <div className="mt-5">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  College Email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@ggits.net"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Use your college email ID ending in{" "}
                  <span className="font-medium text-gray-700">
                    @ggits.net
                  </span>
                  . A verification link will be sent to this email.
                </p>
              </div>

              {/* Password */}
              <div className="mt-5">
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Minimum 6 characters.
                </p>
              </div>

              {/* Age */}
              <div className="mt-5">
                <label
                  htmlFor="age"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Age
                </label>

                <div className="relative">
                  <Calendar
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="age"
                    type="number"
                    min="1"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter your age"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>
            </section>

            {/* Academic Information */}
            <section className="mt-8">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <GraduationCap size={18} />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-gray-950">
                    Academic Information
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    This helps keep the marketplace college-focused.
                  </p>
                </div>
              </div>

              {/* College */}
              <div className="mt-5">
                <label
                  htmlFor="college"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  College
                </label>

                <div className="relative">
                  <GraduationCap
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="college"
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Enter your college"
                    maxLength={100}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="mt-5">
                <label
                  htmlFor="department"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Department
                </label>

                <div className="relative">
                  <Building2
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="department"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    maxLength={100}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>

              {/* Year */}
              <div className="mt-5">
                <label
                  htmlFor="year"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Year
                </label>

                <select
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                >
                  <option value="">
                    Select your year
                  </option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                  <option value="Postgraduate">
                    Postgraduate
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </section>

            {/* Contact */}
            <section className="mt-8">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <Phone size={18} />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-gray-950">
                    Contact Information
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Your mobile number stays private.
                  </p>
                </div>
              </div>

              {/* Mobile */}
              <div className="mt-5">
                <label
                  htmlFor="mobile"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Mobile Number
                </label>

                <div className="relative">
                  <Phone
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="mobile"
                    type="tel"
                    inputMode="numeric"
                    value={mobileNumber}
                    onChange={(e) =>
                      setMobileNumber(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10)
                      )
                    }
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>
            </section>

            {/* Privacy */}
            <div className="mt-7 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-800">
                Privacy
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Your name, age, college, department, and year can
                be viewed by other marketplace users. Your email
                address and mobile number remain private.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-gray-950 px-5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          {/* Login */}
          <p className="mt-6 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-gray-950 transition hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}