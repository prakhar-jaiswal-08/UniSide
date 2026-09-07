import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12 font-sans text-gray-900">
      <div className="mx-auto max-w-4xl">

        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-950"
        >
          <ArrowLeft size={16} />
          Back to Marketplace
        </Link>

        <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-md sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Privacy Policy
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Last updated: September 2026
          </p>

          <div className="mt-8 space-y-7 text-sm leading-7 text-gray-600">

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                1. Information We Collect
              </h2>
              <p className="mt-2">
                The marketplace may collect information provided during
                account creation and profile management, including your
                name, email address, age, college, department, academic
                year, and mobile number.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                2. Public Profile Information
              </h2>
              <p className="mt-2">
                Certain profile information may be displayed publicly
                so that marketplace users can identify listing owners.
                Private information such as email addresses and mobile
                numbers is not included in public profiles.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                3. Listings
              </h2>
              <p className="mt-2">
                Product, service, and roommate listings may be visible
                to other marketplace users. Users are responsible for
                ensuring that information included in their listings
                does not unnecessarily disclose private information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                4. Messages
              </h2>
              <p className="mt-2">
                Messages sent through the marketplace are associated
                with the relevant conversation and participating users.
                Users should avoid sharing sensitive personal
                information through marketplace chats.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                5. Account Security
              </h2>
              <p className="mt-2">
                Users are responsible for maintaining the security of
                their account credentials. Do not share your password
                with other people.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                6. Data Protection
              </h2>
              <p className="mt-2">
                Access to private account information is restricted
                according to the marketplace's authentication and
                database security rules.
              </p>
            </section>

          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <Link
              href="/terms"
              className="text-sm font-medium text-gray-700 hover:text-gray-950 hover:underline"
            >
              View Terms of Use
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}