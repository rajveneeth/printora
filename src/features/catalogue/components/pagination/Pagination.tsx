import type { Route } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildCatalogueHref } from '@/features/catalogue/services';
import styles from './Pagination.module.scss';
import type { PaginationProps } from './Pagination.model';

export function Pagination({ currentPage, totalPages, pathname, filters }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1,
  );

  return (
    <nav className={styles.root} aria-label="Product pages">
      {currentPage > 1 ? (
        <Link href={buildCatalogueHref(pathname, filters, { page: currentPage - 1 }) as Route}>
          <ChevronLeft size={17} /> Previous
        </Link>
      ) : (
        <span className={styles.disabled}>
          <ChevronLeft size={17} /> Previous
        </span>
      )}
      <div>
        {pages.map((page, index) => (
          <span key={page} className={styles.pageSlot}>
            {index > 0 && pages[index - 1] !== page - 1 ? <i>…</i> : null}
            <Link
              href={buildCatalogueHref(pathname, filters, { page }) as Route}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </Link>
          </span>
        ))}
      </div>
      {currentPage < totalPages ? (
        <Link href={buildCatalogueHref(pathname, filters, { page: currentPage + 1 }) as Route}>
          Next <ChevronRight size={17} />
        </Link>
      ) : (
        <span className={styles.disabled}>
          Next <ChevronRight size={17} />
        </span>
      )}
    </nav>
  );
}
