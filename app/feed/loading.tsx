export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-100 px-5 py-8 font-sans text-gray-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />

          <div className="mt-3 h-10 w-52 animate-pulse rounded bg-gray-200" />

          <div className="mt-3 h-5 w-80 max-w-full animate-pulse rounded bg-gray-200" />
        </div>

        {/* Create post */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <div className="h-20 w-full animate-pulse rounded-lg bg-gray-200" />

          <div className="mt-4 flex justify-end">
            <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />

                  <div>
                    <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                    <div className="mt-2 h-3 w-20 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                </div>
              </div>

              <div className="h-72 animate-pulse bg-gray-200" />

              <div className="p-5">
                <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}