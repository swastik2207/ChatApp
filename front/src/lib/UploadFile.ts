import { SIGNED_URL,GET_IMAGE_URL } from "@/lib/apiAuthRoutes";

export async function UploadFile(file: File) {
  // Create a unique key for the file
  const uniqueKey = `uploads/${Date.now()}-${file.name}`;

  // Step 1: Request a signed upload URL from your backend
  const res = await fetch(SIGNED_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: uniqueKey,
      contentType: file.type,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to get signed URL");
  }

  const { url } = await res.json();

  // Step 2: Upload the file to S3 using the signed URL
  const uploadRes = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Something Happened");
  }

  // Step 3: Return the public URL to the file
  const fileUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.amazonaws.com/${uniqueKey}`;

  return {
    fileUrl,
    key: uniqueKey, // return key in case you need to delete later
  };
}


export async function GetUrl(fileUrl:string) {

    const res = await fetch(`${GET_IMAGE_URL}?key=${fileUrl}`);
    const { signedUrl } = await res.json();

    return {signedUrl}
  
}