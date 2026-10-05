import { supabase } from "@/lib/supabase";

export async function uploadProductImage(
  file: File,
  userId: string
) {
  if (!file) {
    throw new Error("No image selected.");
  }

  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("No active Supabase session.");
  }

  const { data, error } =
    await supabase.functions.invoke(
      "cloudinary-signature",
      {
        body: {
          resourceType: "image",
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

  if (error) {
    let details = error.message;

    if (error.context) {
      try {
        const responseBody =
          await error.context.json();

        details =
          responseBody?.error ||
          responseBody?.message ||
          JSON.stringify(responseBody);
      } catch {
        // Keep original error.
      }
    }

    throw new Error(
      details ||
        "Failed to generate Cloudinary signature."
    );
  }

  if (
    !data?.cloudName ||
    !data?.apiKey ||
    !data?.timestamp ||
    !data?.signature ||
    !data?.publicId ||
    !data?.resourceType
  ) {
    throw new Error(
      "Invalid Cloudinary signature response."
    );
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", data.apiKey);
  formData.append(
    "timestamp",
    String(data.timestamp)
  );
  formData.append(
    "signature",
    data.signature
  );
  formData.append(
    "public_id",
    data.publicId
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${data.cloudName}/${data.resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok || !result.secure_url) {
    throw new Error(
      result?.error?.message ||
        "Failed to upload image to Cloudinary."
    );
  }

  // Convert HEIC/HEIF and other images to browser-friendly JPG delivery.
  return result.secure_url.replace(
    "/image/upload/",
    "/image/upload/f_jpg/"
  );
}