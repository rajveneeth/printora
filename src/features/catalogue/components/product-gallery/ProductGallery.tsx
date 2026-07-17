'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import styles from './ProductGallery.module.scss';
import type { ProductGalleryProps } from './ProductGallery.model';

export function ProductGallery({ productName, images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const activeImage = images[activeIndex] ?? images[0];

  useEffect(() => {
    if (!isExpanded) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsExpanded(false);
      if (event.key === 'ArrowLeft')
        setActiveIndex((current) => (current - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight') setActiveIndex((current) => (current + 1) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, isExpanded]);

  if (!activeImage) return null;

  const showPrevious = () =>
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  const showNext = () => setActiveIndex((current) => (current + 1) % images.length);

  return (
    <div className={styles.root}>
      <div className={styles.thumbnails} aria-label={`${productName} images`}>
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            aria-label={`Show image ${index + 1} of ${images.length}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() => setActiveIndex(index)}
          >
            <Image src={image} alt="" fill sizes="80px" />
          </button>
        ))}
      </div>
      <div className={styles.mainImage}>
        <Image
          src={activeImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 56vw"
        />
        <button
          className={styles.expand}
          type="button"
          aria-label="Open full-screen image"
          onClick={() => setIsExpanded(true)}
        >
          <Expand size={18} />
        </button>
        <button
          className={styles.previous}
          type="button"
          aria-label="Previous image"
          onClick={showPrevious}
        >
          <ChevronLeft size={20} />
        </button>
        <button className={styles.next} type="button" aria-label="Next image" onClick={showNext}>
          <ChevronRight size={20} />
        </button>
      </div>
      {isExpanded ? (
        <div
          className={styles.viewer}
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} full-screen image viewer`}
        >
          <button
            className={styles.close}
            type="button"
            aria-label="Close image viewer"
            onClick={() => setIsExpanded(false)}
            autoFocus
          >
            <X size={24} />
          </button>
          <button
            className={styles.viewerPrevious}
            type="button"
            aria-label="Previous image"
            onClick={showPrevious}
          >
            <ChevronLeft size={28} />
          </button>
          <Image src={activeImage} alt={productName} fill sizes="100vw" />
          <button
            className={styles.viewerNext}
            type="button"
            aria-label="Next image"
            onClick={showNext}
          >
            <ChevronRight size={28} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
