import { SellerProfileForm } from '@/features/seller/components';
import { requireSellerProductContext } from '@/features/seller/services';
import type { SellerProfileInput } from '@/features/seller/schemas';
import styles from '../SellerPage.module.scss';

export default async function SellerProfilePage() {
  const { seller } = await requireSellerProductContext();
  const defaultValues: SellerProfileInput = {
    storeName: seller.storeName,
    storeSlug: seller.storeSlug,
    description: seller.description,
    logoUrl: seller.logoUrl ?? '',
    bannerUrl: seller.bannerUrl ?? '',
    contactEmail: seller.contactEmail,
    contactPhone: seller.contactPhone ?? '',
    originCity: seller.originCity,
    originState: seller.originState,
    originPostalCode: seller.originPostalCode,
    yearsExperience: seller.yearsExperience,
    supportedMaterials: seller.supportedMaterials.join(', '),
    printTechnologies: seller.printTechnologies.join(', '),
    maxPrintDimensions: seller.maxPrintDimensions ?? '',
    customOrdersEnabled: seller.customOrdersEnabled,
    averageProcessDays: seller.averageProcessDays,
    declarationAccepted: true,
  };
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Store settings</p>
          <h1>Seller profile</h1>
          <span>Keep public store details and workshop capabilities accurate.</span>
        </div>
      </header>
      <SellerProfileForm defaultValues={defaultValues} mode="profile" />
    </div>
  );
}
