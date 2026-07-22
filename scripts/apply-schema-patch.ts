import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  const sql = neon(url);

  console.log('Connecting to:', url.split('@')[1]);

  console.log('Ensuring "presentationImageUrl" column on "Project"...');
  await sql.query(`
    ALTER TABLE "Project"
    ADD COLUMN IF NOT EXISTS "presentationImageUrl" TEXT
  `);

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
