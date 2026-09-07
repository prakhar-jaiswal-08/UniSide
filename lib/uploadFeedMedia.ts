import { supabase } from "@/lib/supabase";

export async function uploadFeedMedia(
  file: File,
  userId: string
) {
  const fileExt = file.name.split(".").pop()?.toLowerCase();

  if (!fileExt) {
    throw new Error("Invalid file type.");
  }

  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("feed-media")
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from("feed-media")
    .getPublicUrl(filePath);

  return data.publicUrl;
}