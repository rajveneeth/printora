import type { SellerProductImageInput } from '@/features/seller/models';

export interface PreparedProductImage extends SellerProductImageInput {
  readonly position: number;
  readonly isPrimary: boolean;
  readonly fileName: string;
  readonly mimeType: string;
}

export interface ProductImageStorageProvider {
  prepare(images: readonly SellerProductImageInput[]): PreparedProductImage[];
  validateUpload(metadata: ProductImageUploadMetadata): void;
}

export interface ProductImageUploadMetadata {
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
}

export interface LocalUrlImageStorageOptions {
  readonly maxImages: number;
  readonly maxBytes: number;
}

const supportedImageTypes = {
  '.avif': 'image/avif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
} as const;

export class LocalUrlProductImageStorage implements ProductImageStorageProvider {
  constructor(private readonly options: LocalUrlImageStorageOptions) {}

  prepare(images: readonly SellerProductImageInput[]): PreparedProductImage[] {
    if (images.length > this.options.maxImages) {
      throw new Error(`Add no more than ${this.options.maxImages} product images.`);
    }
    return images.map((image, position) => {
      const url = image.url.trim();
      if (!url.startsWith('/catalogue/') || url.includes('..') || url.includes('?')) {
        throw new Error('Development images must use a safe /catalogue/ public path.');
      }
      const fileName = url.split('/').at(-1) ?? '';
      const extensionIndex = fileName.lastIndexOf('.');
      const extension = extensionIndex >= 0 ? fileName.slice(extensionIndex).toLowerCase() : '';
      const mimeType = supportedImageTypes[extension as keyof typeof supportedImageTypes];
      if (!mimeType) {
        throw new Error('Use an AVIF, JPEG, PNG, SVG, or WebP product image.');
      }
      if (fileName.length > 180) {
        throw new Error('The image filename is too long.');
      }
      return {
        url,
        altText: image.altText.trim(),
        position,
        isPrimary: position === 0,
        fileName,
        mimeType,
      };
    });
  }

  validateUpload(metadata: ProductImageUploadMetadata): void {
    if (!Object.values(supportedImageTypes).some((mimeType) => mimeType === metadata.mimeType)) {
      throw new Error('Use an AVIF, JPEG, PNG, SVG, or WebP product image.');
    }
    if (!Number.isInteger(metadata.sizeBytes) || metadata.sizeBytes <= 0) {
      throw new Error('Image size must be a positive whole number of bytes.');
    }
    if (metadata.sizeBytes > this.options.maxBytes) {
      throw new Error(`Each product image must be no larger than ${this.options.maxBytes} bytes.`);
    }
    if (
      metadata.fileName.includes('/') ||
      metadata.fileName.includes('\\') ||
      metadata.fileName.includes('..')
    ) {
      throw new Error('The image filename is not safe.');
    }
  }
}
