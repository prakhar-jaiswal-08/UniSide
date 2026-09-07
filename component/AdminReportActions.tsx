"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import ConfirmDialog from "@/component/ui/ConfirmDialog";

type Props = {
  reportId: number;
};

export default function AdminReportActions({
  reportId,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "resolved" | "dismissed" | null
  >(null);

  function askForConfirmation(
    action: "resolved" | "dismissed"
  ) {
    setSelectedAction(action);
    setShowConfirm(true);
  }

  async function updateStatus(
    status: "resolved" | "dismissed"
  ) {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("reports")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", reportId);

    if (error) {
      console.error(error);
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success(
      status === "resolved"
        ? "Report resolved."
        : "Report dismissed."
    );

    setShowConfirm(false);
    setSelectedAction(null);

    router.refresh();

    setLoading(false);
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">

        {/* Resolve */}

        <button
          type="button"
          disabled={loading}
          onClick={() => askForConfirmation("resolved")}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle size={17} />
          Resolve
        </button>

        {/* Dismiss */}

        <button
          type="button"
          disabled={loading}
          onClick={() => askForConfirmation("dismissed")}
          className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <XCircle size={17} />
          Dismiss
        </button>

      </div>

      {/* Confirmation Dialog */}

      <ConfirmDialog
        open={showConfirm}
        title={
          selectedAction === "resolved"
            ? "Resolve Report"
            : "Dismiss Report"
        }
        description={
          selectedAction === "resolved"
            ? "Are you sure you want to mark this report as resolved?"
            : "Are you sure you want to dismiss this report?"
        }
        onCancel={() => {
          if (!loading) {
            setShowConfirm(false);
            setSelectedAction(null);
          }
        }}
        onConfirm={async () => {
          if (!selectedAction || loading) return;

          await updateStatus(selectedAction);
        }}
      />
    </>
  );
}