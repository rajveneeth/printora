'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { Check, Heart, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui';
import { PriceDisplay } from '@/features/catalogue/components/price-display';
import { useCartStore } from '@/features/cart';
import styles from './ProductPurchasePanel.module.scss';
import type { ProductPurchasePanelProps } from './ProductPurchasePanel.model';

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [status, setStatus] = useState('');
  const [customisation, setCustomisation] = useState('');
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.id === selectedVariantId),
    [product.variants, selectedVariantId],
  );
  const price = product.priceInPaise + (selectedVariant?.priceDeltaInPaise ?? 0);

  const addSelection = (): void => {
    const variantName = selectedVariant?.name ?? 'standard option';
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      sellerId: product.seller.id,
      sellerName: product.seller.name,
      ...(selectedVariant
        ? { variantId: selectedVariant.id, variantName: selectedVariant.name }
        : {}),
      selectedOptions: selectedVariant
        ? [
            { label: 'Material', value: selectedVariant.material },
            { label: 'Colour', value: selectedVariant.colour },
            { label: 'Finish', value: selectedVariant.finish },
          ]
        : [],
      ...(customisation.trim() ? { customisation: customisation.trim() } : {}),
      quantity,
      minimumQuantity: 1,
      maximumQuantity: product.stock,
      availableStock: product.stock,
      unitPriceInPaise: price,
      imageUrl: product.imageUrl,
    });
    setStatus(`${quantity} × ${product.name}, ${variantName}, added for this shopping session.`);
  };

  const buyNow = (): void => {
    addSelection();
    router.push('/checkout' as Route);
  };

  return (
    <div className={styles.root}>
      <PriceDisplay
        priceInPaise={price}
        {...(product.compareAtPriceInPaise === undefined
          ? {}
          : { compareAtPriceInPaise: product.compareAtPriceInPaise })}
        size="large"
        taxNote
      />
      <fieldset className={styles.options}>
        <legend>Choose a finish</legend>
        {product.variants.map((variant) => (
          <label key={variant.id}>
            <input
              type="radio"
              name="variant"
              value={variant.id}
              checked={selectedVariantId === variant.id}
              onChange={() => setSelectedVariantId(variant.id)}
            />
            <span>
              <i
                style={{
                  backgroundColor: `var(--swatch-${variant.colour.toLowerCase().replaceAll(' ', '-')}, var(--secondary))`,
                }}
              />
              <b>{variant.colour}</b>
              <small>
                {variant.material} · {variant.finish}
              </small>
              {selectedVariantId === variant.id ? <Check size={15} aria-hidden="true" /> : null}
            </span>
          </label>
        ))}
      </fieldset>
      {product.customisable ? (
        <div className={styles.customisation}>
          <label htmlFor="customisation-note">Personalisation or colour notes</label>
          <textarea
            id="customisation-note"
            rows={3}
            placeholder="Tell the maker what you would like changed"
            value={customisation}
            onChange={(event) => setCustomisation(event.currentTarget.value)}
          />
          <p>Complex changes may need a separate quotation before production.</p>
        </div>
      ) : null}
      <div className={styles.quantityRow}>
        <span>Quantity</span>
        <div>
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={quantity === 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            <Minus size={15} />
          </button>
          <output aria-label="Quantity">{quantity}</output>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={quantity >= product.stock}
            onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
      <div className={styles.stock}>
        <span aria-hidden="true" />
        {product.stock > 5 ? 'In stock and ready to make' : `Only ${product.stock} available`}
      </div>
      <div className={styles.actions}>
        <Button leftIcon={<ShoppingBag size={17} />} onClick={addSelection}>
          Add to bag
        </Button>
        <button
          className={styles.save}
          type="button"
          aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={isSaved}
          onClick={() => setIsSaved((current) => !current)}
        >
          <Heart size={19} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <button className={styles.buyNow} type="button" onClick={buyNow}>
        Buy now
      </button>
      <p className={styles.status} aria-live="polite">
        {status}
      </p>
    </div>
  );
}
