import Link from 'next/link';
import { BadgeCheck, BriefcaseBusiness, Camera, CreditCard, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/config/site';
import styles from './SiteFooter.module.scss';

const footerGroups = [
  {
    title: 'Discover',
    links: [
      { label: 'Shop all', href: '/products' },
      { label: 'Browse categories', href: '/categories' },
      { label: 'Customisable pieces', href: '/products?customisable=true' },
    ],
  },
  {
    title: 'Customer help',
    links: [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Orders', href: '/account' },
      { label: 'Sign in', href: '/sign-in' },
    ],
  },
  {
    title: 'For makers',
    links: [
      { label: 'Become a seller', href: '/sign-up' },
      { label: 'Seller dashboard', href: '/seller' },
      { label: 'Maker standards', href: '/categories' },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.newsletter}>
          <div>
            <p className={styles.eyebrow}>Fresh from the print bed</p>
            <h2>Useful ideas, unusual objects, and maker stories.</h2>
          </div>
          <form>
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input id="newsletter-email" type="email" placeholder="you@example.com" />
            <button type="submit">Join the list</button>
          </form>
        </div>
        <div className={styles.main}>
          <div className={styles.brandColumn}>
            <Link href="/" className={styles.brand}>
              {siteConfig.name}
            </Link>
            <p>{siteConfig.description}</p>
            <div className={styles.socials}>
              <a href="#footer" aria-label="Formivo on Instagram">
                <Camera size={19} />
              </a>
              <a href="#footer" aria-label="Formivo on LinkedIn">
                <BriefcaseBusiness size={19} />
              </a>
            </div>
          </div>
          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3>{group.title}</h3>
              {group.links.map((link) => (
                <Link key={link.label} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className={styles.bottom} id="footer">
          <p>© 2026 {siteConfig.name}. Made for independent Indian makers.</p>
          <div>
            <span>
              <ShieldCheck size={16} /> Buyer protection
            </span>
            <span>
              <CreditCard size={16} /> Secure payments
            </span>
            <span>
              <BadgeCheck size={16} /> Verified makers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
