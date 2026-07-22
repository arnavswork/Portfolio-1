import 'dotenv/config';
import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

/**
 * One-time setup: configures CORS on the R2 bucket so the admin can upload
 * videos directly from the browser via presigned PUT URLs.
 *
 * R2 token permissions usually don't allow programmatic CORS changes,
 * so we try the API call first and fall back to printing the JSON you
 * can paste into the Cloudflare dashboard (R2 -> Bucket -> Settings -> CORS).
 */
async function main() {
  const bucket = process.env.R2_BUCKET_NAME;
  const accountId = process.env.R2_ACCOUNT_ID;
  if (!bucket || !accountId) {
    throw new Error('R2_BUCKET_NAME and R2_ACCOUNT_ID must be set');
  }

  const allowedOrigins = [
    'http://localhost:9002',
    'http://localhost:3000',
    // Add production domains here:
    // 'https://yourdomain.com',
  ];

  const corsRules = [
    {
      AllowedOrigins: allowedOrigins,
      AllowedMethods: ['PUT', 'GET', 'HEAD'],
      AllowedHeaders: ['*'],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3600,
    },
  ];

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  try {
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: bucket,
        CORSConfiguration: { CORSRules: corsRules },
      })
    );
    console.log(`CORS configured on bucket "${bucket}" for:`);
    for (const o of allowedOrigins) console.log(`  - ${o}`);
  } catch (err: any) {
    console.error(
      `\nCould not set CORS programmatically (${err?.Code ?? 'error'}).`
    );
    console.error('Paste this into Cloudflare dashboard:');
    console.error('  R2 -> Buckets -> <your-bucket> -> Settings -> CORS policy\n');
    console.log(
      JSON.stringify(
        corsRules.map((r) => ({
          AllowedOrigins: r.AllowedOrigins,
          AllowedMethods: r.AllowedMethods,
          AllowedHeaders: r.AllowedHeaders,
          ExposeHeaders: r.ExposeHeaders,
          MaxAgeSeconds: r.MaxAgeSeconds,
        })),
        null,
        2
      )
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
