import { siteConfig } from '@/config/site';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--secondary)]">Prompt 1 foundation</p>
      <h1 className="mt-4 font-[var(--font-heading)] text-5xl font-bold text-[var(--primary)]">{siteConfig.name}</h1>
      <p className="mt-4 max-w-2xl text-lg text-[var(--muted-foreground)]">{siteConfig.tagline}</p>
    </main>
  );
}
