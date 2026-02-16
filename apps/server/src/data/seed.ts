export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  bio: string;
  avatar: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: '1234',
    bio: 'Frontend developer passionate about React and TypeScript.',
    avatar: 'https://i.pravatar.cc/150?img=1',
    createdAt: '2024-01-05T09:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: '1234',
    bio: 'Backend engineer who loves building scalable APIs.',
    avatar: 'https://i.pravatar.cc/150?img=2',
    createdAt: '2024-01-10T10:30:00Z',
  },
  {
    id: 'user-3',
    name: 'Carol Williams',
    email: 'carol@example.com',
    password: '1234',
    bio: 'Full-stack developer with a focus on developer experience.',
    avatar: 'https://i.pravatar.cc/150?img=3',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'user-4',
    name: 'David Brown',
    email: 'david@example.com',
    password: '1234',
    bio: 'DevOps engineer who automates everything.',
    avatar: 'https://i.pravatar.cc/150?img=4',
    createdAt: '2024-02-01T11:00:00Z',
  },
  {
    id: 'user-5',
    name: 'Eva Martinez',
    email: 'eva@example.com',
    password: '1234',
    bio: 'Mobile developer specializing in React Native.',
    avatar: 'https://i.pravatar.cc/150?img=5',
    createdAt: '2024-02-10T14:00:00Z',
  },
  {
    id: 'user-6',
    name: 'Frank Lee',
    email: 'frank@example.com',
    password: '1234',
    bio: 'Security researcher and open source contributor.',
    avatar: 'https://i.pravatar.cc/150?img=6',
    createdAt: '2024-02-20T09:30:00Z',
  },
  {
    id: 'user-7',
    name: 'Grace Kim',
    email: 'grace@example.com',
    password: '1234',
    bio: 'UI/UX designer who codes her own designs.',
    avatar: 'https://i.pravatar.cc/150?img=7',
    createdAt: '2024-03-01T13:00:00Z',
  },
  {
    id: 'user-8',
    name: 'Henry Wilson',
    email: 'henry@example.com',
    password: '1234',
    bio: 'Data engineer working with large-scale pipelines.',
    avatar: 'https://i.pravatar.cc/150?img=8',
    createdAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'user-9',
    name: 'Iris Chen',
    email: 'iris@example.com',
    password: '1234',
    bio: 'Machine learning engineer interested in NLP.',
    avatar: 'https://i.pravatar.cc/150?img=9',
    createdAt: '2024-04-01T08:30:00Z',
  },
  {
    id: 'user-10',
    name: 'Jack Thompson',
    email: 'jack@example.com',
    password: '1234',
    bio: 'Cloud architect with expertise in AWS and GCP.',
    avatar: 'https://i.pravatar.cc/150?img=10',
    createdAt: '2024-04-10T15:00:00Z',
  },
];

const POST_TITLES = [
  'Getting Started with TypeScript',
  'Understanding React Hooks in Depth',
  'Building RESTful APIs with Hono',
  'A Guide to JWT Authentication',
  'Mastering CSS Grid Layout',
  'Introduction to WebSockets',
  'Deploying Apps with Docker',
  'State Management Patterns in React',
  'Testing with Vitest and Testing Library',
  'Optimizing Node.js Performance',
  'GraphQL vs REST: Which to Choose',
  'Building Mobile Apps with React Native',
  'CI/CD Pipelines for Modern Apps',
  'Database Design Best Practices',
  'Understanding OAuth 2.0',
  'Server-Side Rendering Explained',
  'Microservices Architecture Overview',
  'Monorepo Strategies with Turborepo',
  'Accessibility in Web Development',
  'Progressive Web Apps: A Deep Dive',
  'WebAssembly: The Future of the Web',
  'Securing Your Node.js Application',
  'Redis Caching Strategies',
  'Kubernetes for Developers',
  'Building CLI Tools with Node.js',
  'TypeScript Generics Explained',
  'React Performance Optimization Tips',
  'Error Handling in Async JavaScript',
  'Building a Design System from Scratch',
  'Introduction to Edge Computing',
  'Using Zod for Runtime Validation',
  'Streaming Data with Server-Sent Events',
  'Building Real-Time Apps with Socket.io',
  'Introduction to Functional Programming',
  'Working with Dates and Times in JavaScript',
  'Code Splitting and Lazy Loading',
  'API Rate Limiting Techniques',
  'Headless CMS: Pros and Cons',
  'Web Scraping with Playwright',
  'Monitoring Applications with OpenTelemetry',
  'Introduction to Deno',
  'Building Forms with React Hook Form',
  'Understanding the JavaScript Event Loop',
  'Writing Clean Code: Principles and Practices',
  'Feature Flags for Safe Deployments',
  'Internationalization in React Apps',
  'Understanding CORS and How to Fix It',
  'Using Tailwind CSS Effectively',
  'Debugging Tips for React Developers',
  'Introduction to tRPC',
];

const POST_CONTENTS = [
  'In this post, we explore the fundamentals and walk through practical examples step by step.',
  'This article covers key concepts with real-world use cases to help you apply them immediately.',
  'We dive deep into the topic, examining best practices and common pitfalls to avoid.',
  'A hands-on guide with code examples that you can run directly in your project.',
  'We compare different approaches and discuss trade-offs to help you make informed decisions.',
  'From beginner basics to advanced techniques, this comprehensive guide has it all.',
  'We break down complex concepts into digestible pieces with clear explanations.',
  'This tutorial walks you through building a complete feature from scratch.',
  'Learn how to optimize your workflow with these proven techniques and strategies.',
  'We examine real-world scenarios and show you how to solve common problems effectively.',
];

const TAGS_POOL = [
  'typescript',
  'javascript',
  'react',
  'nodejs',
  'api',
  'auth',
  'css',
  'devops',
  'docker',
  'testing',
  'performance',
  'mobile',
  'security',
  'database',
  'cloud',
  'graphql',
  'rest',
  'monorepo',
  'ux',
  'pwa',
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateDate(index: number): string {
  const base = new Date('2024-01-01T00:00:00Z');
  base.setDate(base.getDate() + Math.floor(index * 0.7));
  base.setHours(Math.floor(Math.random() * 14) + 8);
  return base.toISOString();
}

export const POSTS: Post[] = Array.from({ length: 500 }, (_, i) => {
  const userId = USERS[i % USERS.length].id;
  const titleIndex = i % POST_TITLES.length;
  const contentIndex = i % POST_CONTENTS.length;
  const createdAt = generateDate(i);

  return {
    id: `post-${i + 1}`,
    userId,
    title: `${POST_TITLES[titleIndex]}${Math.floor(i / POST_TITLES.length) > 0 ? ` (Part ${Math.floor(i / POST_TITLES.length) + 1})` : ''}`,
    content: POST_CONTENTS[contentIndex],
    tags: pickRandom(TAGS_POOL, 3),
    createdAt,
    updatedAt: createdAt,
  };
});
