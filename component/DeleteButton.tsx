"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Props = {
  productId: number;
};

export default function DeleteButton({ productId }: Props) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    const { data, error } = await supabase
  .from("products")
  .delete()
  .eq("id", productId)
  .select();

console.log(data);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Product deleted successfully!");

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition"
    >
      Delete
    </button>
  );
}