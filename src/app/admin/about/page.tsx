import { getAboutBlocks } from '@/lib/actions';
import { readBlocks } from '@/lib/blocks';
import AboutAdminClient from './client';

export default async function AboutAdminPage() {
  const blocks = await getAboutBlocks();
  return <AboutAdminClient initialBlocks={readBlocks(blocks)} />;
}
