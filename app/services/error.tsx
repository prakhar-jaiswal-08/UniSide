"use client";

import { CircleAlert, RefreshCw } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-gray-100 px-5 py-10 font-sans text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
        <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
          <CircleAlert
            size={32}
            className="mx-auto text-gray-500"
          />

          <h1 className="mt-4 text-lg font-semibold text-gray-900">
            Unable to load services
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Something went wrong while loading the services.
            Please try again.
          </p>

          <button
            type="button"
            onClick={() => reset()}
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