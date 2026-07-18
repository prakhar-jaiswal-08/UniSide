"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-white">
          {title}
        </h2>

        <p className="mt-3 text-gray-400">
          {description}
        </p>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg bg-zinc-700 px-5 py-2 text-white hover:bg-zinc-600"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}