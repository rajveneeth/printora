import { z } from 'zod';

const optionalNumber = (schema: z.ZodNumber) => schema.optional();

const optionalText = z.string().trim().max(600).optional();
const optionalLocalImagePath = z
  .string()
  .trim()
  .max(300)
  .refine(
    (value) => value === '' || (value.startsWith('/catalogue/') && !value.includes('..')),
    'Use a safe local /catalogue/ image path.',
  )
  .optional();

export const sellerProfileSchema = z.object({
  storeName: z.string().trim().min(3).max(80),
  storeSlug: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(40).max(1200),
  logoUrl: optionalLocalImagePath,
  bannerUrl: optionalLocalImagePath,
  contactEmail: z.string().trim().email(),
  contactPhone: optionalText,
  originCity: z.string().trim().min(2).max(80),
  originState: z.string().trim().min(2).max(80),
  originPostalCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/),
  yearsExperience: z.number().int().min(0).max(80),
  supportedMaterials: z.string().trim().min(2).max(300),
  printTechnologies: z.string().trim().min(2).max(300),
  maxPrintDimensions: optionalText,
  customOrdersEnabled: z.boolean(),
  averageProcessDays: z.number().int().min(1).max(90),
  declarationAccepted: z.boolean().refine(Boolean, 'Accept the seller declaration to continue.'),
});

export const sellerProductImageSchema = z.object({
  url: z.string().trim().min(1),
  altText: z.string().trim().min(5).max(180),
});

export const sellerProductVariantSchema = z.object({
  id: optionalText,
  name: z.string().trim().min(2).max(80),
  sku: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/),
  material: optionalText,
  colour: optionalText,
  finish: optionalText,
  priceDelta: z.number().min(-999_999).max(999_999),
  quantity: z.number().int().min(0).max(1_000_000),
  lowStockThreshold: z.number().int().min(0).max(1_000_000),
});

export const sellerProductEditorSchema = z
  .object({
    name: z.string().trim().min(3).max(120),
    slug: z
      .string()
      .trim()
      .min(3)
      .max(140)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    shortDescription: z.string().trim().min(10).max(240),
    fullDescription: z.string().trim().min(20).max(5000),
    categoryId: z.string().min(1),
    basePrice: z.number().positive().max(10_000_000),
    compareAtPrice: optionalNumber(z.number().positive().max(10_000_000)),
    sku: z
      .string()
      .trim()
      .min(3)
      .max(80)
      .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/),
    minOrderQuantity: z.number().int().min(1).max(10_000),
    maxOrderQuantity: optionalNumber(z.number().int().min(1).max(10_000)),
    dimensions: optionalText,
    weightGrams: optionalNumber(z.number().int().positive().max(1_000_000)),
    material: z.string().trim().min(2).max(100),
    finish: optionalText,
    colour: optionalText,
    processingDays: z.number().int().min(1).max(90),
    shippingOrigin: z.string().trim().min(3).max(160),
    customisationEnabled: z.boolean(),
    safetyNotes: optionalText,
    intendedUse: optionalText,
    ageRestriction: optionalText,
    ipDeclaration: z.string().trim().min(20).max(600),
    ipDeclarationAccepted: z.boolean(),
    tags: z.string().trim().max(500),
    searchKeywords: z.string().trim().max(500),
    seoTitle: optionalText,
    seoDescription: optionalText,
    quantity: z.number().int().min(0).max(1_000_000),
    lowStockThreshold: z.number().int().min(0).max(1_000_000),
    images: z.array(sellerProductImageSchema).max(8),
    variants: z.array(sellerProductVariantSchema).max(50),
  })
  .superRefine((product, context) => {
    if (product.compareAtPrice !== undefined && product.compareAtPrice <= product.basePrice) {
      context.addIssue({
        code: 'custom',
        message: 'Compare-at price must be higher than the selling price.',
        path: ['compareAtPrice'],
      });
    }
    if (
      product.maxOrderQuantity !== undefined &&
      product.maxOrderQuantity < product.minOrderQuantity
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Maximum quantity must be at least the minimum quantity.',
        path: ['maxOrderQuantity'],
      });
    }
  });

export const sellerProductSubmissionSchema = sellerProductEditorSchema.superRefine(
  (product, context) => {
    if (product.shortDescription.length < 20) {
      context.addIssue({
        code: 'custom',
        message: 'Add a more useful short description before submitting.',
        path: ['shortDescription'],
      });
    }
    if (product.fullDescription.length < 80) {
      context.addIssue({
        code: 'custom',
        message: 'The full description needs at least 80 characters before submitting.',
        path: ['fullDescription'],
      });
    }
    if (product.images.length === 0) {
      context.addIssue({
        code: 'custom',
        message: 'Add at least one product image before submitting.',
        path: ['images'],
      });
    }
    if (!product.ipDeclarationAccepted) {
      context.addIssue({
        code: 'custom',
        message: 'Confirm the intellectual-property and prohibited-product declaration.',
        path: ['ipDeclarationAccepted'],
      });
    }
  },
);

export const inventoryUpdateSchema = z.object({
  productId: z.string().min(1),
  productQuantity: z.number().int().min(0).max(1_000_000),
  productLowStockThreshold: z.number().int().min(0).max(1_000_000),
  variants: z.array(
    z.object({
      variantId: z.string().min(1),
      quantity: z.number().int().min(0).max(1_000_000),
      lowStockThreshold: z.number().int().min(0).max(1_000_000),
    }),
  ),
});

export type SellerProfileInput = z.infer<typeof sellerProfileSchema>;
export type SellerProductEditorInput = z.infer<typeof sellerProductEditorSchema>;
export type InventoryUpdateInput = z.infer<typeof inventoryUpdateSchema>;
