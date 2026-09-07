"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

type Props = {
  otherUser: string;
  otherUserId: string;
  productName: string;
  listingUrl?: string;
};

export default function ChatHeader({
  otherUser,
  otherUserId,
  productName,
  listingUrl,
}: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleBack() {
    router.back();
  }

  return (
    <header className="relative flex h-[76px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeft size={21} />
        </button>

        <Link
          href={`/profile/user/${otherUserId}`}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
            {otherUser.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-gray-900">
              {otherUser}
            </h2>

            {productName && (
              <p className="truncate text-sm text-gray-500">
                {productName}
              </p>
            )}
          </div>
        </Link>
      </div>

      <div className="relative flex shrink-0 items-center gap-1">
        {listingUrl && (
          <Link
            href={listingUrl}
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 sm:inline-flex"
          >
            <ExternalLink size={16} />
            View listing
          </Link>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="More options"
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <MoreVertical size={20} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 z-20 w-48 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
            <Link
              href={`/profile/user/${otherUserId}`}
              onClick={() => setMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              View profile
            </Link>

            {listingUrl && (
              <Link
                href={listingUrl}
                onClick={() => setMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                View listing
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}