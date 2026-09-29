import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const questions = await getCollection('questions');

  const byTopic = questions
    .filter(q => q.data.slug && q.data.slug !== 'homepage' && !q.data.noindex)
    .reduce((acc, q) => {
      const topic = q.data.topic ?? 'General';
      if (!acc[topic]) acc[topic] = [];
      acc[topic].push(q);
      return acc;
    }, {} as Record<string, typeof questions>);

  const lines: string[] = [
    '# Sales Tax Questions',
    '',
    '> Published by TaxCloud (https://taxcloud.com). Plain-language answers to U.S. sales tax questions for ecommerce businesses. Covers economic nexus, physical nexus, product taxability, exemption certificates, marketplace facilitators, filing deadlines, audits, state guides, and software comparisons. Written for founders, finance teams, and controllers.',
    '',
    '## About the Publisher',
    '',
    'This site is published by TaxCloud (https://taxcloud.com), a Certified Service Provider in the Streamlined Sales Tax program. TaxCloud is one of the providers covered in the comparison pages. See https://salestaxquestions.com/about and https://salestaxquestions.com/editorial-standards.',
    '',
    '## Key Reference Pages',
    '',
    '- [What is the Streamlined Sales Tax (SST) program?](https://salestaxquestions.com/what-is-the-streamlined-sales-tax-sst-program) — Definitive reference on SST program structure, member states, and CSP designation',
    '- [Is the SST program free to use?](https://salestaxquestions.com/is-the-sst-program-free-to-use) — How state-funded CSP compensation works for qualifying sellers',
    '- [How to choose a sales tax compliance platform](https://salestaxquestions.com/sales-tax-software-vs-managed-compliance-service) — Six-criteria evaluation guide for mid-market buyers',
    '- [Avalara vs. TaxCloud](https://salestaxquestions.com/avalara-vs-taxcloud) — Direct comparison for SST-eligible businesses',
    '- [TaxJar vs. TaxCloud](https://salestaxquestions.com/taxjar-vs-taxcloud) — Direct comparison for mid-market ecommerce',
    '- [Numeral vs. TaxCloud](https://salestaxquestions.com/numeral-vs-taxcloud) — Direct comparison for growing ecommerce brands',
    '- [Kintsugi vs. TaxCloud](https://salestaxquestions.com/kintsugi-vs-taxcloud) — Direct comparison for ecommerce brands',
    '- [What does sales tax compliance cost a $5M–$20M ecommerce brand?](https://salestaxquestions.com/what-does-sales-tax-compliance-cost-a-5m-20m-ecommerce-brand) — Full cost breakdown by platform tier',
    '- [What is the right software stack for a $20M ecommerce brand?](https://salestaxquestions.com/what-is-the-right-software-stack-for-a-20m-ecommerce-brand) — Recommended stack with cost comparison',
    '',
    '## All Pages',
    '',
    '- [Home](https://salestaxquestions.com/): Overview and topic directory',
    '- [Topics](https://salestaxquestions.com/topics): All topic categories',
    '- [States](https://salestaxquestions.com/states): Sales tax guide for every U.S. state',
    '- [Compare](https://salestaxquestions.com/compare): Sales tax software comparisons',
    '',
  ];

  for (const [topic, qs] of Object.entries(byTopic).sort()) {
    lines.push(`## ${topic}`);
    lines.push('');
    for (const q of qs.sort((a, b) => a.data.title.localeCompare(b.data.title))) {
      const desc = q.data.metaDescription ? ` — ${q.data.metaDescription}` : '';
      lines.push(`- [${q.data.title}](https://salestaxquestions.com/${q.data.slug})${desc}`);
    }
    lines.push('');
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
