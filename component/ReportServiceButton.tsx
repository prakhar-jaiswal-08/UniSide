"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Flag, X, CheckCircle } from "lucide-react";

type Props = {
  serviceId: string;
};

const reasons = [
  "Spam",
  "Fraud or scam",
  "Fake service",
  "Inappropriate content",
  "Misleading information",
  "Other",
];

export default function ReportServiceButton({
  serviceId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!reason) {
      setError("Please select a reason.");
      return;
    }

    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to report a service.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("reports")
      .insert({
        service_id: serviceId,
        reporter_id: user.id,
        reason,
        description:
          description.trim() || null,
      });

    if (insertError) {
      console.error(insertError);
      setError(
        "Unable to submit the report. Please try again."
      );
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  function closeModal() {
    setOpen(false);
    setReason("");
    setDescription("");
    setError("");
    setSubmitted(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
      >
        <Flag size={18} />
        Report Service
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">

            {!submitted ? (
              <>
                {/* Header */}

                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Report Service
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Tell us why this service should be reviewed.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                  >
                    <X size={22} />
                  </button>

                </div>

                {/* Reason */}

                <div className="mt-6">

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Reason
                  </label>

                  <select
                    value={reason}
                    onChange={(e) =>
                      setReason(e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Select a reason
                    </option>

                    {reasons.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>

                </div>

                {/* Description */}

                <div className="mt-5">

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Additional details
                    <span className="font-normal text-gray-400">
                      {" "}
                      (optional)
                    </span>
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    rows={5}
                    placeholder="Provide any additional information that may help us review this report..."
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

                {/* Error */}

                {error && (
                  <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                {/* Actions */}

                <div className="mt-6 flex gap-3">

                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Submitting..."
                      : "Submit Report"}
                  </button>

                </div>
              </>
            ) : (
              /* Success */

              <div className="py-8 text-center">

                <CheckCircle
                  size={64}
                  className="mx-auto text-green-600"
                />

                <h2 className="mt-5 text-2xl font-bold text-gray-900">
                  Report Submitted
                </h2>

                <p className="mt-3 text-gray-500">
                  Thank you. Your report has been submitted for review.
                </p>

                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-7 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Done
                </button>

              </div>
            )}

          </div>

        </div>
      )}
    </>
  );
}