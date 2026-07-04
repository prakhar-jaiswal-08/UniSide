"use client";

import Link from "next/link";

type Props = {
  otherUser: string;
  productName: string;
};

export default function ChatHeader({
  otherUser,
  productName,
}: Props) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
      <div className="flex items-center gap-4">
        <Link
          href="/chat"
          className="text-xl text-zinc-400 hover:text-white lg:hidden"
        >
          ←
        </Link>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold uppercase text-white">
          {otherUser.charAt(0)}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">
            {otherUser}
          </h2>

          <p className="text-sm text-zinc-400">
            {productName}
          </p>

          <span className="text-xs text-green-500">
            ● Active
          </span>
        </div>
      </div>

      <button className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
        ⋮
      </button>
    </header>
  );
}