// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Slugs of question pages marked `noindex: true` stay out of the sitemap.
function noindexSlugs(dir) {
  const out = new Set();
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { noindexSlugs(p).forEach(s => out.add(s)); continue; }
    if (!p.endsWith('.mdx')) continue;
    const fm = readFileSync(p, 'utf8').split('\n---')[0];
    if (/^noindex:\s*true\s*$/m.test(fm)) {
      const m = fm.match(/^slug:\s*"?([^"\n]+)"?/m);
      if (m) out.add(m[1].trim());
    }
  }
  return out;
}
const excluded = noindexSlugs('./src/content/questions');

export default defineConfig({
  // One canonical host: the apex. Vercel must serve the apex as Production and 308 www to it.
  site: 'https://salestaxquestions.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/+$/, '').replace(/^\//, '');
        return !excluded.has(path);
      },
      // Google treats the bare origin and origin + '/' as the same URL, so the root needs no special case.
      serialize: (item) => ({ ...item, url: item.url.replace(/\/+$/, '') || item.url }),
    }),
  ],
});
