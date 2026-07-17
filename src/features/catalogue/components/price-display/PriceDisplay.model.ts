export interface PriceDisplayProps {
  readonly priceInPaise: number;
  readonly compareAtPriceInPaise?: number;
  readonly size?: 'small' | 'medium' | 'large';
  readonly taxNote?: boolean;
}
