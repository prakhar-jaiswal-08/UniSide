"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "@/component/ui/ConfirmDialog";

type Props = {
  serviceId: number;
  ownerId: string;
};

export default function ServiceOwnerActions({
  serviceId,
  ownerId,
}: Props) {
  const router = useRouter();

  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    checkOwner();
  }, []);

  async function checkOwner() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id === ownerId) {
      setIsOwner(true);
    }

    setLoading(false);
  }

  async function deleteService() {
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Service deleted successfully.");

    router.push("/services");
    router.refresh();
  }

  if (loading) return null;

  if (!isOwner) return null;

  return (
    <>
      <div className="mt-4 flex gap-3">
        <Link
          href={`/services/edit/${serviceId}`}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
        >
          <Pencil size={18} />
          Edit
        </Link>

        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700"
        >
          <Trash2 size={18} />
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
        onCancel={() => setShowConfirm(false)}
        onConfirm={async () => {
          setShowConfirm(false);
          await deleteService();
        }}
      />
    </>
  );
}