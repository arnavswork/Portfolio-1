import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// ✅ UPLOAD
export async function uploadToR2(
  base64Data: string,
  key: string
) {
  if (!base64Data.startsWith("data:")) return base64Data;

  const base64Content = base64Data.split(";base64,").pop();
  if (!base64Content) throw new Error("Invalid base64");

  const buffer = Buffer.from(base64Content, "base64");
  const contentType = base64Data.split(";")[0].split(":")[1];

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

// ✅ DELETE SINGLE FILE
export async function deleteFromR2(key: string) {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  );
}

// ✅ Extract key from URL
export function extractKeyFromUrl(url: string) {
  return url.replace(`${process.env.R2_PUBLIC_URL}/`, "");
}

// ✅ PRESIGNED PUT URL (for direct browser uploads — used for video)
export async function getPresignedPutUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 60 * 10
) {
  const url = await getSignedUrl(
    s3Client,
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: expiresInSeconds }
  );
  return {
    uploadUrl: url,
    publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
  };
}