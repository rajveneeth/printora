'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { Minus, Plus, Store, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { formatPrice } from '@/features/catalogue';
import { calculateCartTotals, groupCartItemsBySeller } from '../../services';
import { useCartStore } from '../../store';
import { CartSummary } from '../cart-summary';
import styles from './CartView.module.scss';

export function CartView() {
  const items = useCartStore((state) => state.items);
  const isHydrated = useCartStore((state) => state.isHydrated);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const groups = groupCartItemsBySeller(items);
  const totals = calculateCartTotals(items);

  if (!isHydrated) {
    return (
      <p className={styles.loading} role="status">
        Loading your shopping bag…
      </p>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Your shopping bag is ready for an idea"
        description="Explore useful prints and one-of-a-kind creations from independent makers."
        action={<Link href="/products">Browse products</Link>}
      />
    );
  }

  return (
    <div className={styles.layout}>
      <div className={styles.groups} aria-live="polite">
        {groups.map((group) => (
          <section className={styles.sellerGroup} key={group.sellerId}>
            <header>
              <span>
                <Store size={17} aria-hidden="true" /> Made by {group.sellerName}
              </span>
              <small>
                {group.shippingInPaise
                  ? `${formatPrice(group.shippingInPaise)} delivery`
                  : 'Free delivery'}
              </small>
            </header>
            {group.items.map((item) => (
              <article className={styles.line} key={item.lineId}>
                <Link className={styles.image} href={`/products/${item.productSlug}`}>
                  <Image src={item.imageUrl} alt="" width={132} height={132} />
                </Link>
                <div className={styles.details}>
                  <Link href={`/products/${item.productSlug}`}>
                    <h2>{item.productName}</h2>
                  </Link>
                  {item.variantName ? <p>{item.variantName}</p> : null}
                  {item.selectedOptions.length ? (
                    <dl>
                      {item.selectedOptions.map((option) => (
                        <div key={`${option.label}-${option.value}`}>
                          <dt>{option.label}</dt>
                          <dd>{option.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {item.customisation ? <p>Note: {item.customisation}</p> : null}
                  <button
                    className={styles.remove}
                    type="button"
                    onClick={() => removeItem(item.lineId)}
                  >
                    <Trash2 size={15} aria-hidden="true" /> Remove
                  </button>
                </div>
                <div className={styles.lineActions}>
                  <strong>{formatPrice(item.unitPriceInPaise * item.quantity)}</strong>
                  <div className={styles.quantity}>
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.productName}`}
                      disabled={item.quantity <= item.minimumQuantity}
                      onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                    >
                      <Minus size={15} />
                    </button>
                    <output aria-label={`Quantity of ${item.productName}`}>{item.quantity}</output>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.productName}`}
                      disabled={
                        item.quantity >= item.maximumQuantity ||
                        item.quantity >= item.availableStock
                      }
                      onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <small>{formatPrice(item.unitPriceInPaise)} each</small>
                </div>
              </article>
            ))}
          </section>
        ))}
      </div>
      <CartSummary
        totals={totals}
        action={
          <Link className={styles.checkout} href={'/checkout' as Route}>
            Continue to checkout
          </Link>
        }
      />
    </div>
  );
}
