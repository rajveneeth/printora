'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { Check, CreditCard, MapPin, PackageCheck, ShieldCheck } from 'lucide-react';
import { Button, EmptyState } from '@/components/ui';
import {
  calculateCartTotals,
  CartSummary,
  groupCartItemsBySeller,
  useCartStore,
} from '@/features/cart';
import { formatPrice } from '@/features/catalogue';
import { siteConfig } from '@/config/site';
import { confirmPaymentAction, createCheckoutAction } from '../../actions';
import type { CheckoutPaymentDetails } from '../../models';
import { AddressManager } from '../address-manager';
import styles from './CheckoutReview.module.scss';
import type { CheckoutReviewProps, RazorpayCheckoutSuccess } from './CheckoutReview.model';

const loadRazorpay = async (): Promise<boolean> => {
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.append(script);
  });
};

export function CheckoutReview({ addresses, customer }: CheckoutReviewProps) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const isHydrated = useCartStore((state) => state.isHydrated);
  const clearCart = useCartStore((state) => state.clearCart);
  const totals = calculateCartTotals(items);
  const groups = groupCartItemsBySeller(items);
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id ?? '');
  const [payment, setPayment] = useState<CheckoutPaymentDetails | null>(null);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  const finishPayment = async (
    confirmation: Parameters<typeof confirmPaymentAction>[0],
  ): Promise<void> => {
    setIsSubmitting(true);
    const result = await confirmPaymentAction(confirmation);
    setIsSubmitting(false);
    if (result.status === 'succeeded') {
      clearCart();
      router.push(`/checkout/success?order=${encodeURIComponent(result.orderNumber)}` as Route);
      return;
    }
    if (result.status === 'failed') {
      router.push(
        `/checkout/failure?order=${encodeURIComponent(result.orderNumber)}&reason=${encodeURIComponent(result.message)}` as Route,
      );
      return;
    }
    setStatus(result.message);
  };

  const openRazorpay = async (details: CheckoutPaymentDetails): Promise<void> => {
    if (!details.publicKeyId || !(await loadRazorpay()) || !window.Razorpay) {
      setStatus('Razorpay Checkout could not load. Your order remains pending; please try again.');
      return;
    }
    const instance = new window.Razorpay({
      key: details.publicKeyId,
      amount: details.amountInPaise,
      currency: details.currency,
      name: siteConfig.name,
      description: 'Marketplace order',
      order_id: details.providerOrderId,
      prefill: customer,
      theme: { color: '#174a3a' },
      handler: (response: RazorpayCheckoutSuccess) => {
        void finishPayment({
          provider: 'RAZORPAY',
          paymentId: details.paymentId,
          providerOrderId: response.razorpay_order_id,
          providerPaymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });
      },
    });
    instance.on('payment.failed', () => {
      setStatus('Razorpay reported an unsuccessful attempt. No paid status was recorded.');
    });
    instance.open();
  };

  const beginCheckout = async (): Promise<void> => {
    if (!selectedAddressId) {
      setStatus('Add and select a delivery address before continuing.');
      return;
    }
    setIsSubmitting(true);
    setStatus('Checking current prices, maker status, and stock…');
    const result = await createCheckoutAction({
      addressId: selectedAddressId,
      idempotencyKey,
      items: items.map((item) => ({
        productSlug: item.productSlug,
        ...(item.variantId ? { variantId: item.variantId } : {}),
        quantity: item.quantity,
        displayedUnitPriceInPaise: item.unitPriceInPaise,
        ...(item.customisation ? { customisation: item.customisation } : {}),
        selectedOptions: item.selectedOptions,
      })),
    });
    setIsSubmitting(false);
    if (result.status === 'error') {
      setStatus(result.message);
      setIdempotencyKey(crypto.randomUUID());
      return;
    }
    setPayment(result.payment);
    setStatus(
      result.payment.provider === 'MOCK'
        ? 'Order reserved. Choose a simulated provider response below.'
        : 'Provider order created. Complete payment in the secure Razorpay window.',
    );
    if (result.payment.provider === 'RAZORPAY') await openRazorpay(result.payment);
  };

  if (!isHydrated)
    return (
      <p className={styles.loading} role="status">
        Loading checkout…
      </p>
    );
  if (!items.length) {
    return (
      <EmptyState
        title="There are no items to check out"
        description="Add a creation to your shopping bag before choosing delivery and payment."
        action={<Link href="/products">Browse products</Link>}
      />
    );
  }

  return (
    <div className={styles.layout}>
      <div className={styles.steps}>
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span>
              <MapPin size={18} />
            </span>
            <div>
              <small>Step 1</small>
              <h2>Delivery address</h2>
            </div>
          </div>
          <AddressManager
            addresses={addresses}
            selectable
            selectedAddressId={selectedAddressId}
            onSelect={setSelectedAddressId}
          />
        </section>
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span>
              <PackageCheck size={18} />
            </span>
            <div>
              <small>Step 2</small>
              <h2>Review items</h2>
            </div>
          </div>
          <div className={styles.reviewGroups}>
            {groups.map((group) => (
              <div key={group.sellerId}>
                <h3>{group.sellerName}</h3>
                {group.items.map((item) => (
                  <article key={item.lineId}>
                    <Image src={item.imageUrl} alt="" width={72} height={72} />
                    <div>
                      <strong>{item.productName}</strong>
                      <small>
                        {item.variantName ?? 'Standard option'} · Qty {item.quantity}
                      </small>
                    </div>
                    <b>{formatPrice(item.unitPriceInPaise * item.quantity)}</b>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </section>
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span>
              <CreditCard size={18} />
            </span>
            <div>
              <small>Step 3</small>
              <h2>Payment</h2>
            </div>
          </div>
          <div className={styles.paymentNote}>
            <ShieldCheck size={20} />
            <p>
              Payment is recorded only after a verified provider response. Browser status values are
              never trusted.
            </p>
          </div>
          {payment?.provider === 'MOCK' ? (
            <div className={styles.mockPanel}>
              <strong>Local mock provider</strong>
              <p>
                No money is charged. These controls ask the server-side mock adapter to return a
                simulated response.
              </p>
              <div>
                <Button
                  isLoading={isSubmitting}
                  onClick={() =>
                    void finishPayment({
                      provider: 'MOCK',
                      paymentId: payment.paymentId,
                      outcome: 'success',
                    })
                  }
                >
                  <Check size={16} /> Simulate success
                </Button>
                <Button
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() =>
                    void finishPayment({
                      provider: 'MOCK',
                      paymentId: payment.paymentId,
                      outcome: 'failure',
                    })
                  }
                >
                  Simulate failure
                </Button>
              </div>
            </div>
          ) : null}
          <p className={styles.status} role="status" aria-live="polite">
            {status}
          </p>
        </section>
      </div>
      <CartSummary
        title="Checkout total"
        totals={totals}
        action={
          payment ? null : (
            <Button size="lg" isLoading={isSubmitting} onClick={() => void beginCheckout()}>
              Validate and continue to payment
            </Button>
          )
        }
      />
    </div>
  );
}
