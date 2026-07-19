import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  CheckCircle2,
  CreditCard,
  PackageCheck,
  PencilRuler,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  UsersRound,
} from 'lucide-react';
import { Badge } from '@/components/ui';
import {
  categories,
  CategoryNavigation,
  ProductGrid,
  products,
  sellers,
} from '@/features/catalogue';
import styles from './HomePage.module.scss';

const trustItems = [
  {
    icon: UsersRound,
    title: 'Independent makers',
    detail: 'Thoughtful objects from Indian studios',
  },
  { icon: PencilRuler, title: 'Custom requests', detail: 'Small changes or a completely new idea' },
  { icon: ShieldCheck, title: 'Secure payments', detail: 'Clear pricing and buyer protection' },
  { icon: Truck, title: 'Tracked delivery', detail: 'Follow each step to your doorstep' },
] as const;

const customSteps = [
  ['01', 'Post your idea', 'Share a sketch, photo, reference, or written brief.'],
  ['02', 'Receive quotations', 'Verified makers propose materials, timing, and price.'],
  ['03', 'Compare and select', 'Choose the maker and approach that feels right.'],
  ['04', 'Approve the design', 'Review details before your maker starts production.'],
  ['05', 'Track delivery', 'Follow printing, finishing, dispatch, and arrival.'],
] as const;

const trendingProducts = [...products]
  .sort((left, right) => right.popularity - left.popularity)
  .slice(0, 4);
const bestSellers = [...products]
  .sort((left, right) => right.rating - left.rating || right.reviewCount - left.reviewCount)
  .slice(0, 4);
const recentProducts = [...products]
  .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  .slice(0, 4);
const customProducts = products.filter((product) => product.customisable).slice(0, 4);

export default function HomePage() {
  return (
    <main id="main-content" className={styles.root}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Badge className={styles.heroBadge} tone="success">
            <Sparkles size={13} /> Made by independent creators
          </Badge>
          <h1>
            Find it, customise it, or <span>bring it to life.</span>
          </h1>
          <p>
            Discover unique 3D-printed products from independent makers, or post your own idea and
            receive quotations from verified creators.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/products">
              Shop products <ArrowRight size={17} />
            </Link>
            <Link className={styles.secondaryAction} href="/products?customisable=true">
              Post your idea
            </Link>
          </div>
          <div className={styles.heroProof}>
            <div>
              <span>4.8</span>
              <span>
                <Star size={14} fill="currentColor" /> maker rating
              </span>
            </div>
            <div>
              <span>1,300+</span>
              <span>creations delivered</span>
            </div>
          </div>
        </div>
        <div className={styles.heroImage}>
          <Image
            src="/catalogue/hero-studio.svg"
            alt="3D printed planter, phone stand, and playful figure in a maker studio"
            fill
            priority
            sizes="(max-width: 850px) 100vw, 55vw"
          />
          <div className={styles.floatingCard}>
            <CheckCircle2 size={18} />
            <span>
              <b>Made for you</b>
              <small>Choose colours, finishes, and details</small>
            </span>
          </div>
        </div>
      </section>
      <section className={styles.trustStrip} aria-label="Why shop with Formivo">
        {trustItems.map(({ icon: Icon, title, detail }) => (
          <div key={title}>
            <span>
              <Icon size={19} />
            </span>
            <p>
              <b>{title}</b>
              <small>{detail}</small>
            </p>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p>Browse by interest</p>
            <h2>Shop by category</h2>
          </div>
          <Link href="/categories">
            View every category <ArrowRight size={15} />
          </Link>
        </div>
        <CategoryNavigation categories={categories.slice(0, 6)} compact />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p>Popular this week</p>
            <h2>Trending creations</h2>
          </div>
          <Link href="/products">
            Shop all <ArrowRight size={15} />
          </Link>
        </div>
        <ProductGrid products={trendingProducts} priorityCount={2} />
      </section>

      <section className={styles.customCta}>
        <div className={styles.customCopy}>
          <Badge tone="warning">
            <PencilRuler size={13} /> Custom made, without the guesswork
          </Badge>
          <h2>Have an idea in mind?</h2>
          <p>
            Post a sketch, photograph, reference, or written description. Verified makers can
            respond with quotations shaped around your needs.
          </p>
          <Link href="/products?customisable=true">
            Start with your idea <ArrowRight size={17} />
          </Link>
        </div>
        <div className={styles.blueprint} aria-hidden="true">
          <Boxes size={154} strokeWidth={0.8} />
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p>Made to adapt</p>
            <h2>Customisable products</h2>
          </div>
          <Link href="/products?customisable=true">
            See customisable pieces <ArrowRight size={15} />
          </Link>
        </div>
        <ProductGrid products={customProducts} />
      </section>

      <section className={styles.steps} id="how-it-works">
        <div className={styles.sectionHeading}>
          <div>
            <p>From thought to tangible</p>
            <h2>How custom orders work</h2>
          </div>
        </div>
        <ol>
          {customSteps.map(([number, title, description]) => (
            <li key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p>Customer favourites</p>
            <h2>Best sellers</h2>
          </div>
          <Link href="/products?sort=rating">
            Highest rated <ArrowRight size={15} />
          </Link>
        </div>
        <ProductGrid products={bestSellers} />
      </section>

      <section className={styles.makers}>
        <div className={styles.sectionHeading}>
          <div>
            <p>People behind the products</p>
            <h2>Meet verified makers</h2>
          </div>
          <Link href="/sign-up">
            Become a seller <ArrowRight size={15} />
          </Link>
        </div>
        <div className={styles.makerGrid}>
          {sellers.slice(0, 3).map((seller, index) => (
            <article key={seller.id}>
              <div className={styles.makerAvatar}>
                {seller.name
                  .split(' ')
                  .map((word) => word[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <h3>
                  {seller.name} <BadgeCheck size={16} aria-label="Verified maker" />
                </h3>
                <p>
                  {seller.city}, {seller.state}
                </p>
              </div>
              <div className={styles.makerStats}>
                <span>
                  <Star size={14} fill="currentColor" /> {seller.rating}
                </span>
                <span>{seller.completedOrders} orders</span>
              </div>
              <p>{seller.supportedMaterials.join(' · ')}</p>
              <Link href={index === 0 ? '/products' : '/categories'}>Explore their work</Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p>Just off the print bed</p>
            <h2>Recently added</h2>
          </div>
          <Link href="/products?sort=newest">
            See what’s new <ArrowRight size={15} />
          </Link>
        </div>
        <ProductGrid products={recentProducts} />
      </section>

      <section className={styles.closingTrust}>
        <Quote size={30} />
        <blockquote>
          “The best objects are the ones that solve a small problem beautifully.”
        </blockquote>
        <div>
          <span>
            <PackageCheck size={18} /> Tracked from maker to you
          </span>
          <span>
            <CreditCard size={18} /> Transparent pricing
          </span>
        </div>
      </section>
    </main>
  );
}
