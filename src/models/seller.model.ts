export type SellerVerificationStatus =
  | 'NOT_APPLIED'
  | 'PENDING'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface SellerProfileModel {
  id: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  description: string;
  originCity: string;
  originState: string;
  supportedMaterials: string[];
  printTechnologies: string[];
  customOrdersEnabled: boolean;
  verificationStatus: SellerVerificationStatus;
}
