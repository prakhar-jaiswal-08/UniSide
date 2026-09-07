"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  fallback?: string;
  label?: string;
};

export default function BackButton({
  fallback = "/",
  label = "Back",
}: Props) {
  const router = useRouter();

  function handleBack() {
    /*
     * Use the browser's actual navigation history.
     *
     * This preserves the exact previous URL, including:
     * - search
     * - filters
     * - sorting
     * - pagination
     * - query parameters
     */
    if (window.history.length > 1) {
      router.back();
      return;
    }

    /*
     * If the page was opened directly and there is no
     * useful browser history, use the supplied fallback.
     */
    router.push(fallback);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-950"
    >
      <ArrowLeft size={17} />
      {label}
    </button>
  );
}