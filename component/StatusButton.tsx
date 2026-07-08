"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Props = {
  productId: number;
  currentStatus: string;
};

export default function StatusButton({
  productId,
  currentStatus,
}: Props) {
  const router = useRouter();

  async function updateStatus(status: string) {
    const { error } = await supabase
      .from("products")
      .update({ status })
      .eq("id", productId);

    if (!error) {
      router.refresh();
    }
  }

  return (
    <select
  value={currentStatus}
  onChange={(e) => updateStatus(e.target.value)}
  className="
    w-40
    rounded-lg
    border
    border-gray-300
    bg-white
    px-3
    py-2
    text-sm
    font-medium
    text-gray-700
    shadow-sm
    focus:border-blue-500
    focus:outline-none
  "
>
  <option value="available">🟢 Available</option>
  <option value="reserved">🟡 Reserved</option>
  <option value="sold">🔴 Sold</option>
</select>
  );
}