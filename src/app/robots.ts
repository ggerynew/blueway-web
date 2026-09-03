import type { MetadataRoute } from 'next';
import { absUrl } from '@/lib/site';

export const dynamic = 'force-static';

/**
 * Az AI-válaszmotorok robotjai, nevesítve.
 *
 * A `*` szabály eleve mindent beenged, tehát ezek a sorok technikailag nem
 * változtatnak semmin. Azért állnak itt mégis, mert szándéknyilatkozatok: ha
 * valaki később szűkíti a `*` szabályt, ezek akkor is engedélyt adnak, és
 * fordítva — ha a cég meggondolja magát valamelyik motorral kapcsolatban, itt
 * az egy sor, amit át kell írni `disallow`-ra.
 *
 * A Google-Extended és az Applebot-Extended külön eset: nem keresőrobotok,
 * hanem azt szabályozzák, felhasználható-e a tartalom a Gemini, illetve az
 * Apple Intelligence válaszaihoz. A weblap gépi olvasásra készült rétege
 * (llms.txt, llms-full.txt, ai/termekek.json) épp ezt a célt szolgálja, ezért
 * itt is engedélyezve vannak.
 */
const AI_ROBOTOK = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
  'Amazonbot',
  'Bytespider',
  'cohere-ai',
  'MistralAI-User',
  'DuckAssistBot',
  'meta-externalfetcher',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...AI_ROBOTOK.map((ua) => ({ userAgent: ua, allow: '/' })),
    ],
    sitemap: absUrl('sitemap.xml'),
  };
}
