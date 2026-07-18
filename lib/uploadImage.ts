import { supabase } from "@/lib/supabase";

export async function uploadImage(file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}