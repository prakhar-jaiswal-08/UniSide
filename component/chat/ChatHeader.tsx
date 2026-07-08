"use client";

import Link from "next/link";
import { ArrowLeft, MoreVertical } from "lucide-react";

type Props = {
  otherUser: string;
  productName: string;
};

export default function ChatHeader({
  otherUser,
  productName,
}: Props) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#2a3942] bg-[#202c33] px-5">

      <div className="flex items-center gap-4">

        {/* Mobile Back */}
        <Link
          href="/chat"
          className="rounded-full p-2 text-gray-400 transition hover:bg-[#2a3942] hover:text-white md:hidden"
        >
          <ArrowLeft size={20} />
        </Link>

        {/* Avatar */}
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-lg font-bold uppercase text-white">
          {otherUser.charAt(0)}
        </div>

        {/* User Info */}
        <div className="min-w-0">

          <h2 className="truncate text-base font-semibold text-white">
            {otherUser}
          </h2>

          <p className="truncate text-sm text-gray-400">
            {productName}
          </p>

          <p className="text-xs text-green-400">
            ● Active
          </p>

        </div>

      </div>

      {/* Menu */}
      <button className="rounded-full p-2 text-gray-400 transition hover:bg-[#2a3942] hover:text-white">
        <MoreVertical size={20} />
      </button>

    </header>
  );
}