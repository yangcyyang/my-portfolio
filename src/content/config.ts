import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).optional().default([]),
    draft: z.boolean().optional().default(false),
  }),
});

const murmurs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/murmurs' }),
  schema: z.object({
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).optional().default([]),
    mood: z.string().optional(),
  }),
});

export const collections = { blog, murmurs };
