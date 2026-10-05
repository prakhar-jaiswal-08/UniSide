import { supabase } from "@/lib/supabase";

export async function prepareImageFile(file: File): Promise<File> {
  const fileExt = file.name.split(".").pop()?.toLowerCase();

  const isHeic =
    fileExt === "heic" ||
    fileExt === "heif" ||
    file.type === "image/heic" ||
    file.type === "image/heif";

  if (!isHeic) {
    return file;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/convert-heic", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        "This HEIC image could not be processed. Please try saving it as JPG and upload again."
      );
    }

    const jpegBlob = await response.blob();

    return new File(
      [jpegBlob],
      file.name.replace(/\.(heic|heif)$/i, ".jpg"),
      {
        type: "image/jpeg",
        lastModified: file.lastModified,
      }
    );
  } catch (error) {
    console.error("HEIC conversion failed:", error);

    throw new Error(
      "This HEIC image could not be processed. Please try saving it as JPG and upload again."
    );
  }
}

export async function uploadImage(
  file: File,
  bucket: string = "product-images"
) {
  const uploadFile = await prepareImageFile(file);

  const fileExt =
    uploadFile.name.split(".").pop()?.toLowerCase() || "jpg";

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, uploadFile, {
      contentType: uploadFile.type,
    });

  if (uploadError) {
    console.error("Image upload failed:", uploadError);

    throw new Error("Image upload failed. Please try again.");
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return data.publicUrl;
}