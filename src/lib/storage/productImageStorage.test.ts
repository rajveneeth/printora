import { LocalUrlProductImageStorage } from './productImageStorage';

describe('local product image storage', () => {
  const storage = new LocalUrlProductImageStorage({ maxImages: 2, maxBytes: 1024 });

  it('normalises image positions and cover state', () => {
    const images = storage.prepare([
      { url: '/catalogue/phone.png', altText: 'Phone stand front view' },
      { url: '/catalogue/phone-side.webp', altText: 'Phone stand side view' },
    ]);
    expect(images[0]).toMatchObject({ position: 0, isPrimary: true, mimeType: 'image/png' });
    expect(images[1]).toMatchObject({ position: 1, isPrimary: false, mimeType: 'image/webp' });
  });

  it('rejects traversal, unsupported file types, and excess image count', () => {
    expect(() =>
      storage.prepare([{ url: '/catalogue/../secret.png', altText: 'Unsafe image' }]),
    ).toThrow(/safe/i);
    expect(() =>
      storage.prepare([{ url: '/catalogue/model.exe', altText: 'Unsafe file' }]),
    ).toThrow(/avif/i);
    expect(() =>
      storage.prepare([
        { url: '/catalogue/a.png', altText: 'First image' },
        { url: '/catalogue/b.png', altText: 'Second image' },
        { url: '/catalogue/c.png', altText: 'Third image' },
      ]),
    ).toThrow(/no more than 2/i);
  });

  it('validates upload metadata before a future binary provider receives it', () => {
    expect(() =>
      storage.validateUpload({ fileName: 'product.png', mimeType: 'image/png', sizeBytes: 512 }),
    ).not.toThrow();
    expect(() =>
      storage.validateUpload({ fileName: 'product.png', mimeType: 'image/png', sizeBytes: 2048 }),
    ).toThrow(/no larger/i);
    expect(() =>
      storage.validateUpload({ fileName: '../product.png', mimeType: 'image/png', sizeBytes: 512 }),
    ).toThrow(/not safe/i);
  });
});
