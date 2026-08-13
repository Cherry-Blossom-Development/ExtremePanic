import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Own bucket, own IAM user, own credentials -- entirely separate from
// Breakroom/Prosaurus's "prosaurus-breakroom-uploads" bucket. See CLAUDE.md.
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "extremepanic-uploads";
const BUCKET_REGION = process.env.S3_BUCKET_REGION || "us-west-2";

const globalForS3 = globalThis as unknown as {
  s3: S3Client | undefined;
};

function client() {
  if (globalForS3.s3) return globalForS3.s3;

  const s3 = new S3Client({
    region: BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  });

  if (process.env.NODE_ENV !== "production") globalForS3.s3 = s3;
  return s3;
}

export function getS3Url(key: string) {
  return `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${key}`;
}

// Returns the object's key if the given URL points at our bucket, so a
// replaced/deleted review image can be cleaned up. Returns null for
// manually-pasted external URLs, which we never try to delete.
export function keyFromS3Url(url: string): string | null {
  const prefix = `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

// Generic putter used for both review images and review videos -- nothing
// about it is media-type-specific beyond the contentType passed in.
export async function uploadReviewMedia({
  buffer,
  key,
  contentType,
}: {
  buffer: Buffer;
  key: string;
  contentType: string;
}) {
  await client().send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "max-age=31536000",
    }),
  );
  return getS3Url(key);
}

export async function deleteS3Object(key: string) {
  await client().send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
}
