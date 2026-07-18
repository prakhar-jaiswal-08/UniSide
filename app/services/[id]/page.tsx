import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import MessageButton from "@/component/MessageButton";
import {
  Wrench,
  CheckCircle,
  Clock3,
  XCircle,
} from "lucide-react";
import ServiceOwnerActions from "@/component/ServiceOwnerActions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ServiceDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: service, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !service) {
    notFound();
  }

  const { data: provider } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", service.user_id)
    .single();

  
  return (
    <main className="mx-auto max-w-6xl px-8 py-10">
      <Link
        href="/services"
        className="mb-8 inline-block text-blue-600 hover:underline"
      >
        ← Back to Services
      </Link>

      <div className="grid gap-10 rounded-2xl bg-white p-8 shadow-2xl md:grid-cols-2">
        {/* Image */}

        <div>
          {service.image_url ? (
            <Image
              src={service.image_url}
              alt={service.title}
              width={600}
              height={600}
              className="h-[450px] w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-[450px] w-full items-center justify-center rounded-xl bg-gray-100">
              <Wrench
                size={80}
                className="text-gray-400"
              />
            </div>
          )}
        </div>

        {/* Details */}

        <div>
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              {service.category}
            </span>

          <span
  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
    service.status === "Available"
      ? "bg-green-100 text-green-700"
      : service.status === "Reserved"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700"
  }`}
>
  {service.status === "Available" && <CheckCircle size={16} />}
  {service.status === "Reserved" && <Clock3 size={16} />}
  {service.status === "Completed" && <XCircle size={16} />}

  {service.status}
</span>
          </div>

          <h1 className="mt-5 text-4xl font-bold">
            {service.title}
          </h1>

          <p className="mt-4 text-3xl font-bold text-blue-600">
            {service.pricing_type === "Free"
              ? "Free"
              : service.price
              ? `₹${service.price} • ${service.pricing_type}`
              : "Contact"}
          </p>

          <div className="mt-8">
            <h2 className="text-xl font-bold">
              Description
            </h2>

            <p className="mt-3 whitespace-pre-line text-gray-700">
              {service.description}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="font-bold">
              Location
            </h2>

            <p className="mt-2">
              {service.location || "Not specified"}
            </p>
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-bold">
              Service Provider
            </h2>

            <p className="mt-3">
              <span className="font-semibold">
                Name:
              </span>{" "}
              {provider?.name ?? "Unknown"}
            </p>

            <p className="mt-2">
              <span className="font-semibold">
                Email:
              </span>{" "}
              {provider?.email ?? "Not Available"}
            </p>

            <p className="mt-2">
              <span className="font-semibold">
                Posted:
              </span>{" "}
              {new Date(service.created_at).toLocaleDateString()}
            </p>
          </div>
             {service.status === "Completed" ? (
  <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-center font-semibold text-red-700">
    ✅ This service has been completed and is no longer available.
  </div>
) : (
  <MessageButton
    listingId={service.id.toString()}
    listingType="service"
    sellerId={service.user_id}
    buttonText="Message Provider"
  />
)}
         <ServiceOwnerActions
  serviceId={service.id}
  ownerId={service.user_id}
/>
        </div>
      </div>
    </main>
  );
}