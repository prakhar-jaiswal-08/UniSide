"use client";

type Service = {
  id?: number;
  title: string;
  description: string;
  category: string;
  price: number | null;
  pricing_type: string;
  location: string;
  status?: string;
  image_url?: string;
};

type ServiceFormProps = {
  mode: "create" | "edit";
  initialData?: Service;
};

export default function ServiceForm({
  mode,
  initialData,
}: ServiceFormProps) {
  return (
    <form className="mt-10 space-y-6">
      <h2 className="text-2xl font-bold">
        {mode === "create"
          ? "Offer a Service"
          : "Edit Service"}
      </h2>

      <div>
        <label className="mb-2 block font-medium">
          Service Title
        </label>

        <input
          defaultValue={initialData?.title}
          className="w-full rounded-xl border p-3"
          placeholder="Math Tutor"
        />
      </div>

      <button
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white"
      >
        {mode === "create"
          ? "Offer Service"
          : "Save Changes"}
      </button>
    </form>
  );
}