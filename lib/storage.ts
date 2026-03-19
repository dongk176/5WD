import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION?.trim() || process.env.AWS_DEFAULT_REGION?.trim() || "";
const BUCKET = (process.env.S3_BUCKET || process.env.AWS_S3_BUCKET || "").trim();

let s3Client: S3Client | null = null;

type AssetFolder = "tour" | "discography" | "gallery" | "team";

function getS3(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: REGION,
      forcePathStyle: true,
    });
  }
  return s3Client;
}

function getExtension(fileName: string): string {
  const match = fileName.toLowerCase().match(/(\.[a-z0-9]+)$/);
  return match?.[1] || "";
}

function buildAssetKey(folder: AssetFolder, originalName: string): string {
  const date = new Date();
  const yyyy = String(date.getUTCFullYear());
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `5wd/${folder}/${yyyy}/${mm}/${randomUUID()}${getExtension(originalName)}`;
}

function buildLocalAssetPath(folder: AssetFolder, originalName: string): string {
  return `/uploads/${folder}/${Date.now()}-${randomUUID()}${getExtension(originalName)}`;
}

export function isS3Configured(): boolean {
  return Boolean(REGION && BUCKET);
}

export function isDirectAssetUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith("/");
}

export async function resolveAssetUrl(asset: string | null | undefined): Promise<string> {
  if (!asset) return "";
  if (isDirectAssetUrl(asset)) return asset;
  if (!isS3Configured()) return "";

  return getSignedUrl(
    getS3(),
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: asset,
    }),
    { expiresIn: 60 * 60 * 24 },
  );
}

export async function uploadFileAsset(params: {
  file: File;
  folder: AssetFolder;
}): Promise<string | null> {
  const { file, folder } = params;
  if (!file || file.size <= 0) return null;

  const bytes = await file.arrayBuffer();
  const body = Buffer.from(bytes);
  const contentType = file.type || "application/octet-stream";

  if (isS3Configured()) {
    const key = buildAssetKey(folder, file.name);
    await getS3().send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return key;
  }

  const localPath = buildLocalAssetPath(folder, file.name);
  const absolutePath = path.join(process.cwd(), "public", localPath.replace("/uploads/", "uploads/"));
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, body);
  return localPath;
}
