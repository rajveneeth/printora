import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { sellerEnvironment } from '@/lib/validation/environment';
import { PrismaSellerRepository } from '../repositories';
import { canViewSellerDashboard } from '../permissions';

export const sellerRepository = new PrismaSellerRepository(prisma);

export const getSellerRouteContext = async () => {
  if (!sellerEnvironment.SELLER_DASHBOARD_ENABLED) {
    redirect('/unauthorised');
  }
  const session = await requireSession();
  if (!canViewSellerDashboard(session.user)) {
    redirect('/unauthorised');
  }
  const workspace = await sellerRepository.findSellerWorkspaceByUserId(session.user.id);
  return { session, workspace };
};

export const requireSellerProductContext = async () => {
  const context = await getSellerRouteContext();
  if (
    !canViewSellerDashboard(context.session.user) ||
    !context.workspace.seller ||
    !context.workspace.application
  ) {
    redirect('/seller/onboarding');
  }
  return { ...context, seller: context.workspace.seller };
};
