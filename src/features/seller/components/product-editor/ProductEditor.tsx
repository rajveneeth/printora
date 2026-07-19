'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { saveSellerProductAction } from '../../actions';
import type { ProductSaveIntent } from '../../models';
import { sellerProductEditorSchema, type SellerProductEditorInput } from '../../schemas';
import styles from './ProductEditor.module.scss';

interface ProductEditorProps {
  readonly categories: readonly { id: string; name: string }[];
  readonly defaultValues: SellerProductEditorInput;
  readonly productId?: string;
}

export function ProductEditor({ categories, defaultValues, productId }: ProductEditorProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SellerProductEditorInput>({
    resolver: zodResolver(sellerProductEditorSchema),
    defaultValues,
  });
  const images = useFieldArray({ control, name: 'images' });
  const variants = useFieldArray({ control, name: 'variants' });

  const save = (intent: ProductSaveIntent) =>
    handleSubmit((values) => {
      startTransition(async () => {
        const result = await saveSellerProductAction(productId ?? null, intent, values);
        setMessage(result.message);
        if (result.status === 'success' && intent === 'SUBMIT_REVIEW') {
          router.push('/seller/products');
          router.refresh();
        } else if (result.status === 'success' && !productId && result.productId) {
          router.push(`/seller/products/${result.productId}/edit`);
          router.refresh();
        }
      });
    })();

  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()} noValidate>
      <section className={styles.section} aria-labelledby="basic-details-heading">
        <header className={styles.sectionHeading}>
          <span>1</span>
          <div>
            <h2 id="basic-details-heading">Basic details</h2>
            <p>Use clear, original product information that buyers can understand quickly.</p>
          </div>
        </header>
        <div className={styles.grid}>
          <Input label="Product name" error={errors.name?.message} {...register('name')} />
          <Input
            label="Product URL slug"
            hint="Lowercase letters, numbers, and hyphens only."
            error={errors.slug?.message}
            {...register('slug')}
          />
        </div>
        <Textarea
          label="Short description"
          error={errors.shortDescription?.message}
          {...register('shortDescription')}
        />
        <Textarea
          label="Full description"
          hint="Describe construction, fit, finish, use, and what is included."
          error={errors.fullDescription?.message}
          {...register('fullDescription')}
        />
      </section>

      <section className={styles.section} aria-labelledby="category-heading">
        <header className={styles.sectionHeading}>
          <span>2</span>
          <div>
            <h2 id="category-heading">Category</h2>
            <p>Choose the closest active marketplace category.</p>
          </div>
        </header>
        <Select
          label="Product category"
          placeholder="Choose a category"
          options={categories.map((category) => ({ label: category.name, value: category.id }))}
          error={errors.categoryId?.message}
          {...register('categoryId')}
        />
      </section>

      <section className={styles.section} aria-labelledby="images-heading">
        <header className={styles.sectionHeading}>
          <span>3</span>
          <div>
            <h2 id="images-heading">Images</h2>
            <p>The first image is the cover. Development uses safe local catalogue paths.</p>
          </div>
        </header>
        <div className={styles.stack}>
          {images.fields.map((image, index) => (
            <fieldset className={styles.repeatable} key={image.id}>
              <legend>Image {index + 1}</legend>
              <div className={styles.grid}>
                <Input
                  label="Local image path"
                  hint="For example /catalogue/minimal-phone-stand.svg"
                  error={errors.images?.[index]?.url?.message}
                  {...register(`images.${index}.url`)}
                />
                <Input
                  label="Alternative text"
                  error={errors.images?.[index]?.altText?.message}
                  {...register(`images.${index}.altText`)}
                />
              </div>
              <div className={styles.inlineActions}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => images.move(index, index - 1)}
                  leftIcon={<ArrowUp aria-hidden="true" size={15} />}
                >
                  Move up
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === images.fields.length - 1}
                  onClick={() => images.move(index, index + 1)}
                  leftIcon={<ArrowDown aria-hidden="true" size={15} />}
                >
                  Move down
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => images.remove(index)}
                  leftIcon={<Trash2 aria-hidden="true" size={15} />}
                >
                  Remove
                </Button>
              </div>
            </fieldset>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={images.fields.length >= 8}
          onClick={() => images.append({ url: '', altText: '' })}
          leftIcon={<Plus aria-hidden="true" size={16} />}
        >
          Add image
        </Button>
      </section>

      <section className={styles.section} aria-labelledby="pricing-heading">
        <header className={styles.sectionHeading}>
          <span>4</span>
          <div>
            <h2 id="pricing-heading">Pricing</h2>
            <p>Enter rupee values. Prices are stored precisely in PostgreSQL.</p>
          </div>
        </header>
        <div className={styles.grid}>
          <Input
            label="Selling price (₹)"
            type="number"
            min="0.01"
            step="0.01"
            error={errors.basePrice?.message}
            {...register('basePrice', { valueAsNumber: true })}
          />
          <Input
            label="Compare-at price (₹)"
            type="number"
            min="0.01"
            step="0.01"
            error={errors.compareAtPrice?.message}
            {...register('compareAtPrice', {
              setValueAs: (value: string) => (value === '' ? undefined : Number(value)),
            })}
          />
          <Input label="Base SKU" error={errors.sku?.message} {...register('sku')} />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="inventory-heading">
        <header className={styles.sectionHeading}>
          <span>5</span>
          <div>
            <h2 id="inventory-heading">Inventory</h2>
            <p>Set base stock and buyer quantity limits. Variant stock is configured below.</p>
          </div>
        </header>
        <div className={styles.grid}>
          <Input
            label="Base stock"
            type="number"
            min={0}
            error={errors.quantity?.message}
            {...register('quantity', { valueAsNumber: true })}
          />
          <Input
            label="Low-stock threshold"
            type="number"
            min={0}
            error={errors.lowStockThreshold?.message}
            {...register('lowStockThreshold', { valueAsNumber: true })}
          />
          <Input
            label="Minimum order quantity"
            type="number"
            min={1}
            error={errors.minOrderQuantity?.message}
            {...register('minOrderQuantity', { valueAsNumber: true })}
          />
          <Input
            label="Maximum order quantity"
            type="number"
            min={1}
            error={errors.maxOrderQuantity?.message}
            {...register('maxOrderQuantity', {
              setValueAs: (value: string) => (value === '' ? undefined : Number(value)),
            })}
          />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="variants-heading">
        <header className={styles.sectionHeading}>
          <span>6</span>
          <div>
            <h2 id="variants-heading">Variants</h2>
            <p>Add distinct SKUs for material, colour, or finish combinations.</p>
          </div>
        </header>
        <div className={styles.stack}>
          {variants.fields.map((variant, index) => (
            <fieldset className={styles.repeatable} key={variant.id}>
              <legend>Variant {index + 1}</legend>
              <input type="hidden" {...register(`variants.${index}.id`)} />
              <div className={styles.gridThree}>
                <Input
                  label="Variant name"
                  error={errors.variants?.[index]?.name?.message}
                  {...register(`variants.${index}.name`)}
                />
                <Input
                  label="Variant SKU"
                  error={errors.variants?.[index]?.sku?.message}
                  {...register(`variants.${index}.sku`)}
                />
                <Input
                  label="Price change (₹)"
                  type="number"
                  step="0.01"
                  error={errors.variants?.[index]?.priceDelta?.message}
                  {...register(`variants.${index}.priceDelta`, { valueAsNumber: true })}
                />
                <Input label="Material" {...register(`variants.${index}.material`)} />
                <Input label="Colour" {...register(`variants.${index}.colour`)} />
                <Input label="Finish" {...register(`variants.${index}.finish`)} />
                <Input
                  label="Stock"
                  type="number"
                  min={0}
                  error={errors.variants?.[index]?.quantity?.message}
                  {...register(`variants.${index}.quantity`, { valueAsNumber: true })}
                />
                <Input
                  label="Low-stock threshold"
                  type="number"
                  min={0}
                  error={errors.variants?.[index]?.lowStockThreshold?.message}
                  {...register(`variants.${index}.lowStockThreshold`, { valueAsNumber: true })}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => variants.remove(index)}
                leftIcon={<Trash2 aria-hidden="true" size={15} />}
              >
                Remove variant
              </Button>
            </fieldset>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            variants.append({
              name: '',
              sku: '',
              material: '',
              colour: '',
              finish: '',
              priceDelta: 0,
              quantity: 0,
              lowStockThreshold: 5,
            })
          }
          leftIcon={<Plus aria-hidden="true" size={16} />}
        >
          Add variant
        </Button>
      </section>

      <section className={styles.section} aria-labelledby="materials-heading">
        <header className={styles.sectionHeading}>
          <span>7</span>
          <div>
            <h2 id="materials-heading">Materials and finish</h2>
            <p>Describe the default physical specification.</p>
          </div>
        </header>
        <div className={styles.gridThree}>
          <Input label="Material" error={errors.material?.message} {...register('material')} />
          <Input label="Finish" error={errors.finish?.message} {...register('finish')} />
          <Input label="Colour" error={errors.colour?.message} {...register('colour')} />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="shipping-heading">
        <header className={styles.sectionHeading}>
          <span>8</span>
          <div>
            <h2 id="shipping-heading">Dimensions and shipping</h2>
            <p>Accurate fulfilment information helps set buyer expectations.</p>
          </div>
        </header>
        <div className={styles.grid}>
          <Input
            label="Dimensions"
            error={errors.dimensions?.message}
            {...register('dimensions')}
          />
          <Input
            label="Weight in grams"
            type="number"
            min={1}
            error={errors.weightGrams?.message}
            {...register('weightGrams', {
              setValueAs: (value: string) => (value === '' ? undefined : Number(value)),
            })}
          />
          <Input
            label="Processing time in days"
            type="number"
            min={1}
            max={90}
            error={errors.processingDays?.message}
            {...register('processingDays', { valueAsNumber: true })}
          />
          <Input
            label="Shipping origin"
            error={errors.shippingOrigin?.message}
            {...register('shippingOrigin')}
          />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="customisation-heading">
        <header className={styles.sectionHeading}>
          <span>9</span>
          <div>
            <h2 id="customisation-heading">Customisation</h2>
            <p>Let buyers know whether minor product changes are available.</p>
          </div>
        </header>
        <label className={styles.checkbox}>
          <input type="checkbox" {...register('customisationEnabled')} />
          Buyers may request minor customisation for this product.
        </label>
      </section>

      <section className={styles.section} aria-labelledby="seo-heading">
        <header className={styles.sectionHeading}>
          <span>10</span>
          <div>
            <h2 id="seo-heading">Discovery and SEO</h2>
            <p>Use accurate terms, separated by commas. Avoid keyword stuffing.</p>
          </div>
        </header>
        <div className={styles.grid}>
          <Input label="Tags" error={errors.tags?.message} {...register('tags')} />
          <Input
            label="Search keywords"
            error={errors.searchKeywords?.message}
            {...register('searchKeywords')}
          />
          <Input label="SEO title" error={errors.seoTitle?.message} {...register('seoTitle')} />
          <Input
            label="SEO description"
            error={errors.seoDescription?.message}
            {...register('seoDescription')}
          />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="safety-heading">
        <header className={styles.sectionHeading}>
          <span>11</span>
          <div>
            <h2 id="safety-heading">Safety and declaration</h2>
            <p>Listings are reviewed before they can appear publicly.</p>
          </div>
        </header>
        <div className={styles.grid}>
          <Textarea
            label="Safety notes"
            error={errors.safetyNotes?.message}
            {...register('safetyNotes')}
          />
          <Textarea
            label="Intended use"
            error={errors.intendedUse?.message}
            {...register('intendedUse')}
          />
        </div>
        <Input
          label="Age restriction, if applicable"
          error={errors.ageRestriction?.message}
          {...register('ageRestriction')}
        />
        <Textarea
          label="Intellectual-property declaration"
          error={errors.ipDeclaration?.message}
          {...register('ipDeclaration')}
        />
        <label className={styles.checkbox}>
          <input type="checkbox" {...register('ipDeclarationAccepted')} />I confirm I may sell this
          design and it is not a prohibited product.
        </label>
        {errors.ipDeclarationAccepted?.message ? (
          <p className={styles.error}>{errors.ipDeclarationAccepted.message}</p>
        ) : null}
      </section>

      <section className={styles.review} aria-labelledby="review-heading">
        <header className={styles.sectionHeading}>
          <span>12</span>
          <div>
            <h2 id="review-heading">Save or submit</h2>
            <p>
              Drafts remain private. Submission sends the listing to an administrator; it cannot be
              published until approved.
            </p>
          </div>
        </header>
        <div className={styles.footerActions}>
          <Button
            type="button"
            variant="outline"
            isLoading={isPending}
            onClick={() => save('SAVE_DRAFT')}
          >
            Save draft
          </Button>
          <Button type="button" isLoading={isPending} onClick={() => save('SUBMIT_REVIEW')}>
            Save and submit for review
          </Button>
          <Link href="/seller/products">Cancel</Link>
        </div>
        <p className={styles.message} aria-live="polite">
          {message}
        </p>
      </section>
    </form>
  );
}
