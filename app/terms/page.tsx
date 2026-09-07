import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12 font-sans text-gray-900">
      <div className="mx-auto max-w-4xl">

        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-950"
        >
          <ArrowLeft size={16} />
          Back to Uniside
        </Link>

        <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-md sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Terms of Use
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Last updated: September 2026
          </p>

          <div className="mt-8 space-y-7 text-sm leading-7 text-gray-600">

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                1. Use of Uniside
              </h2>
              <p className="mt-2">
                Uniside is a platform intended for students and members
                of the college community to buy and sell products, offer
                and discover services, find roommates, communicate with
                other users, and participate in the campus community
                through the Feed. Users are responsible for the
                information and content they provide on the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                2. Listings
              </h2>
              <p className="mt-2">
                Users must provide accurate information about their
                products, services, and roommate listings. Misleading,
                fraudulent, illegal, or inappropriate listings are not
                permitted. Users should ensure that their listings comply
                with applicable laws and college policies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                3. Campus Feed
              </h2>
              <p className="mt-2">
                The Feed allows users to share posts, images, videos,
                comments, and replies with the campus community. Users
                are responsible for everything they publish through the
                Feed. Content that is misleading, fraudulent, illegal,
                threatening, abusive, hateful, sexually explicit, or
                otherwise inappropriate is not permitted.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                4. Transactions
              </h2>
              <p className="mt-2">
                Uniside does not guarantee or participate in transactions
                between users. Users should independently verify listings,
                products, services, and roommate arrangements and exercise
                appropriate caution before meeting another user or
                completing a transaction.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                5. Communication
              </h2>
              <p className="mt-2">
                Users must use the messaging and communication features
                responsibly. Harassment, threats, spam, scams,
                impersonation, and abusive behavior are not permitted.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                6. Reports and Moderation
              </h2>
              <p className="mt-2">
                Users may report listings or Feed content that violates
                these terms. Administrators may review reports and take
                appropriate action, including removing listings or Feed
                posts that violate Uniside rules.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                7. User Responsibility
              </h2>
              <p className="mt-2">
                Users are responsible for their own actions, listings,
                posts, comments, media, communications, and transactions
                conducted through Uniside. Users should not share
                sensitive personal information publicly or with users
                they do not trust.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                8. Content Removal
              </h2>
              <p className="mt-2">
                Uniside may remove or restrict access to listings, Feed
                posts, comments, or other content that violates these
                terms or creates a safety, security, or community
                concern.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                9. Platform Availability
              </h2>
              <p className="mt-2">
                Uniside is provided as a platform for the college
                community and may be updated, modified, suspended, or
                unavailable from time to time. Users should not rely on
                the platform as a guarantee of availability or successful
                transactions.
              </p>
            </section>

          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <Link
              href="/privacy"
              className="text-sm font-medium text-gray-700 hover:text-gray-950 hover:underline"
            >
              View Privacy Policy
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}