import { Badge } from '@/components/ui';
import { SellerProfileForm } from '@/features/seller/components';
import { getSellerRouteContext } from '@/features/seller/services';
import type { SellerProfileInput } from '@/features/seller/schemas';
import styles from '../SellerPage.module.scss';

export default async function SellerOnboardingPage() {
  const { session, workspace } = await getSellerRouteContext();
  const seller = workspace.seller;
  const defaultValues: SellerProfileInput = {
    storeName: seller?.storeName ?? '',
    storeSlug: seller?.storeSlug ?? '',
    description: seller?.description ?? '',
    logoUrl: seller?.logoUrl ?? '',
    bannerUrl: seller?.bannerUrl ?? '',
    contactEmail: seller?.contactEmail ?? session.user.email,
    contactPhone: seller?.contactPhone ?? '',
    originCity: seller?.originCity === 'Not provided' ? '' : (seller?.originCity ?? ''),
    originState: seller?.originState === 'Not provided' ? '' : (seller?.originState ?? ''),
    originPostalCode: seller?.originPostalCode === '000000' ? '' : (seller?.originPostalCode ?? ''),
    yearsExperience: seller?.yearsExperience ?? 0,
    supportedMaterials: seller?.supportedMaterials.join(', ') ?? '',
    printTechnologies: seller?.printTechnologies.join(', ') ?? '',
    maxPrintDimensions: seller?.maxPrintDimensions ?? '',
    customOrdersEnabled: seller?.customOrdersEnabled ?? true,
    averageProcessDays: seller?.averageProcessDays ?? 5,
    declarationAccepted: false,
  };
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Seller onboarding</p>
          <h1>Build your maker profile</h1>
          <span>
            Applications are reviewed before stores can submit listings or publish products.
          </span>
        </div>
        {workspace.application ? (
          <Badge tone={workspace.application.status === 'CHANGES_REQUESTED' ? 'warning' : 'info'}>
            {workspace.application.status.replaceAll('_', ' ')}
          </Badge>
        ) : null}
      </header>
      {workspace.application?.changeRequestNote ? (
        <div className={styles.notice} role="status">
          <strong>Changes requested</strong>
          <p>{workspace.application.changeRequestNote}</p>
        </div>
      ) : null}
      <SellerProfileForm defaultValues={defaultValues} mode="onboarding" />
    </div>
  );
}
