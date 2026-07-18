"use client";

import Link from "next/link";
import { MoreVertical, ArrowLeft } from "lucide-react";

type Props = {
  otherUser: string;
  otherUserId: string;
  productName: string;
};

export default function ChatHeader({
  otherUser,
  otherUserId,
  productName,
}: Props) {
  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-[#2a3942] bg-[#202c33] px-6">

      <div className="flex items-center gap-4">

        <Link
          href="/chat"
          className="rounded-full p-2 text-gray-400 transition hover:bg-[#2a3942] hover:text-white"
        >
          <ArrowLeft size={20} />
        </Link>

        <Link
  href={`/profile/${otherUserId}`}
  className="flex items-center gap-4 rounded-lg p-1 transition hover:bg-[#2a3942]"
>
  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold uppercase text-white">
    {otherUser.charAt(0)}
  </div>

  <div>
    <h2 className="text-lg font-semibold text-white">
      {otherUser}
    </h2>

    <p className="text-sm text-blue-400">
      {productName}
    </p>
  </div>
</Link>

      </div>

      <button className="rounded-full p-2 text-gray-400 transition hover:bg-[#2a3942] hover:text-white">
        <MoreVertical size={20} />
      </button>

    </header>
  );
}