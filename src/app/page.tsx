import { Badge, Button, Card, EmptyState, ErrorState, Input, Select, Skeleton } from '@/components/ui';
import { siteConfig } from '@/config/site';

export default function HomePage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[var(--container-max)] gap-8 px-[var(--gutter)] py-12">
      <section className="grid gap-6 rounded-xl border border-border bg-surface p-6 shadow-soft md:grid-cols-[1.15fr_0.85fr] md:p-10">
        <div className="flex flex-col justify-center gap-5">
          <Badge tone="success">Design system foundation</Badge>
          <div className="grid gap-3">
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-primary md:text-6xl">{siteConfig.name}</h1>
            <p className="max-w-2xl text-lg text-muted-foreground">Reusable green marketplace tokens and components for {siteConfig.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button>Shop products</Button>
            <Button variant="accent">Post your idea</Button>
            <Button variant="outline">Become a seller</Button>
          </div>
        </div>
        <Card as="section" className="grid gap-4 bg-surface-subtle">
          <Input label="Search" placeholder="What would you like to create?" />
          <Select label="Popular category" placeholder="Choose category" options={[{ label: 'Phone stands', value: 'phone-stands' }, { label: 'Planters', value: 'planters' }]} />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton label="Loading card one" className="h-20" />
            <Skeleton label="Loading card two" className="h-20" />
            <Skeleton label="Loading card three" className="h-20" />
          </div>
        </Card>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <EmptyState title="Empty states are reusable" description="Use this pattern for empty carts, wishlists, orders, quotes, and admin queues." action={<Button variant="secondary">Add listing</Button>} />
        <ErrorState title="Error states are reusable" description="Use this pattern for upload failures, permission issues, and payment failures." action={<Button variant="outline">Try again</Button>} />
      </section>
    </main>
  );
}
