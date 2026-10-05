import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";
export const maxDuration = 60;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "No image file was provided." },
        { status: 400 }
      );
    }

    const maxFileSize = 15 * 1024 * 1024;

    if (file.size > maxFileSize) {
      return Response.json(
        {
          error:
            "Image is too large. Please choose an image under 15 MB.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          format: "jpg",
          quality: 85,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    if (!result?.secure_url) {
      throw new Error("Cloudinary did not return a converted image.");
    }

    const convertedResponse = await fetch(result.secure_url);

    if (!convertedResponse.ok) {
      throw new Error("Could not retrieve converted image.");
    }

    const jpegBuffer = await convertedResponse.arrayBuffer();

    return new Response(jpegBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `inline; filename="${file.name.replace(
          /\.(heic|heif)$/i,
          ".jpg"
        )}"`,
      },
    });
  } catch (error) {
    console.error("Cloudinary HEIC conversion failed:", error);

    return Response.json(
      {
        error:
          "This HEIC image could not be processed. Please try saving it as JPG and upload again.",
      },
      { status: 500 }
    );
  }
}