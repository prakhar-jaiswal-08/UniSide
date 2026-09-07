import { supabase } from "@/lib/supabase";

export async function uploadImage(
  file: File,
  bucket: string = "product-images"
) {
  let uploadFile = file;
  let fileExt = file.name.split(".").pop()?.toLowerCase();

  const isHeic =
    fileExt === "heic" ||
    fileExt === "heif" ||
    file.type === "image/heic" ||
    file.type === "image/heif";

  if (isHeic) {
    try {
      const heic2any = (await import("heic2any")).default;

      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9,
      });

      const jpegBlob = Array.isArray(converted)
        ? converted[0]
        : converted;

      uploadFile = new File(
        [jpegBlob],
        file.name.replace(/\.(heic|heif)$/i, ".jpg"),
        {
          type: "image/jpeg",
        }
      );

      fileExt = "jpg";
    } catch {
      throw new Error(
        "HEIC image could not be converted. Please try a JPG or PNG image."
      );
    }
  }

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, uploadFile, {
      contentType: uploadFile.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return data.publicUrl;
}