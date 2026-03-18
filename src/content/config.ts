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

const profile = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/profile' }),
  schema: z.object({
    name: z.string(),
    displayName: z.string(),
    heroEyebrow: z.string(),
    heroSubtitle: z.string(),
    roleSummary: z.string(),
    focusSummary: z.string(),
    email: z.string(),
    phone: z.string(),
    wechat: z.string().optional(),
    location: z.string(),
    about: z.array(z.string()),
    currentWork: z.array(
      z.object({
        text: z.string(),
        href: z.string(),
      }),
    ),
    highlights: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
        icon: z.string(),
        desc: z.string(),
      }),
    ),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    description: z.string(),
    cover: z.string().optional(),
    heroBackground: z.string().optional(),
    hideStatus: z.boolean().optional().default(false),
    source: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    status: z.enum(['已完成', '进行中', '规划中']).default('进行中'),
    highlights: z.array(z.string()).optional().default([]),
    order: z.number().default(999),
    featured: z.boolean().default(false),
  }),
});

const resume = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/resume' }),
  schema: z.object({
    name: z.string(),
    title: z.string(),
    phone: z.string(),
    email: z.string(),
    location: z.string(),
    age: z.string().optional(),
    education: z.array(
      z.object({
        school: z.string(),
        major: z.string(),
        degree: z.string(),
        period: z.string(),
      }),
    ),
    summary: z.array(z.string()),
    experiences: z.array(
      z.object({
        company: z.string(),
        role: z.string(),
        period: z.string(),
        points: z.array(
          z.union([
            z.string(),
            z.object({
              text: z.string(),
              period: z.string().optional(),
              level: z.number().optional(),
            }),
          ]),
        ),
      }),
    ),
    projectHighlights: z.array(
      z.union([
        z.string(),
        z.object({
          label: z.string(),
          href: z.string(),
        }),
      ]),
    ),
    skills: z.array(z.string()),
  }),
});

export const collections = { blog, murmurs, profile, projects, resume };
