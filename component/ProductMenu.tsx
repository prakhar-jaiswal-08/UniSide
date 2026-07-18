"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import ReportProductButton from "./ReportProductButton";

type Props = {
  productId: number;
  sellerId: string;
};

export default function ProductMenu({
  productId,
  sellerId,
}: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full p-2 text-gray-700 transition hover:bg-gray-100"
      >
       <MoreVertical
  size={22}
  className="text-gray-700"
/>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border bg-white p-2 shadow-xl">
          <ReportProductButton
            productId={productId}
            sellerId={sellerId}
          />
        </div>
      )}
    </div>
  );
}