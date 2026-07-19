import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaCheckoutRepository } from '@/features/checkout';
import { RazorpayPaymentProvider } from '@/lib/payments';
import { prisma } from '@/lib/prisma';
import { paymentEnvironment } from '@/lib/validation/environment';

export const runtime = 'nodejs';

const webhookSchema = z.object({
  event: z.enum(['payment.captured', 'payment.failed']),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string().min(1),
        order_id: z.string().min(1),
      }),
    }),
  }),
});

const repository = new PrismaCheckoutRepository(prisma);
const maximumWebhookBytes = 1_000_000;

export async function POST(request: Request) {
  if (
    paymentEnvironment.PAYMENT_PROVIDER !== 'razorpay' ||
    !paymentEnvironment.RAZORPAY_KEY_ID ||
    !paymentEnvironment.RAZORPAY_KEY_SECRET ||
    !paymentEnvironment.RAZORPAY_WEBHOOK_SECRET
  ) {
    return NextResponse.json({ error: 'Razorpay is not configured.' }, { status: 503 });
  }
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > maximumWebhookBytes) {
    return NextResponse.json({ error: 'Webhook payload is too large.' }, { status: 413 });
  }
  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > maximumWebhookBytes) {
    return NextResponse.json({ error: 'Webhook payload is too large.' }, { status: 413 });
  }
  const signature = request.headers.get('x-razorpay-signature');
  const providerEventId = request.headers.get('x-razorpay-event-id');
  if (!signature || !providerEventId) {
    return NextResponse.json({ error: 'Missing webhook authentication.' }, { status: 400 });
  }
  const provider = new RazorpayPaymentProvider({
    keyId: paymentEnvironment.RAZORPAY_KEY_ID,
    keySecret: paymentEnvironment.RAZORPAY_KEY_SECRET,
    webhookSecret: paymentEnvironment.RAZORPAY_WEBHOOK_SECRET,
  });
  if (!provider.verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }
  try {
    const unknownPayload: unknown = JSON.parse(rawBody);
    const event = webhookSchema.parse(unknownPayload);
    const paymentEntity = event.payload.payment.entity;
    const payment = await repository.findPaymentByProviderOrderId(paymentEntity.order_id);
    if (!payment || payment.provider !== 'RAZORPAY') {
      return NextResponse.json({ accepted: true });
    }
    const result = await provider.verifyPaymentState({
      providerOrderId: payment.providerOrderId,
      providerPaymentId: paymentEntity.id,
      expectedAmountInPaise: payment.amountInPaise,
      currency: payment.currency,
    });
    await repository.finalizePayment({
      paymentId: payment.paymentId,
      result: { ...result, providerEventId, eventType: event.event },
    });
    return NextResponse.json({ accepted: true });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
