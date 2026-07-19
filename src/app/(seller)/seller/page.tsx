import Link from 'next/link';
import { AlertTriangle, ArrowRight, PackagePlus } from 'lucide-react';
import { Badge, Card, EmptyState } from '@/components/ui';
import { MetricCard } from '@/features/seller/components';
import { canViewSellerDashboard } from '@/features/seller/permissions';
import { getSellerRouteContext, sellerRepository } from '@/features/seller/services';
import { formatPrice } from '@/features/catalogue/services';
import styles from './SellerDashboard.module.scss';

const verificationGuidance = (status: string): string => {
  if (status === 'SUSPENDED' || status === 'REJECTED') {
    return 'Product changes are disabled. Review the seller decision before continuing.';
  }
  return 'You may prepare drafts, but review submission and publication require approval.';
};

export default async function SellerPage() {
  const { session, workspace } = await getSellerRouteContext();
  if (!workspace.seller || !workspace.application) {
    return (
      <EmptyState
        title="Open your Formivo store"
        description="Complete one seller application to introduce your workshop, capabilities, and shipping origin."
        action={<Link href="/seller/onboarding">Start seller onboarding</Link>}
      />
    );
  }
  if (!canViewSellerDashboard(session.user)) {
    return (
      <Card className={styles.applicationState}>
        <Badge tone="warning">{workspace.seller.verificationStatus.replaceAll('_', ' ')}</Badge>
        <h1>Your seller application is being reviewed</h1>
        <p>
          You can revise your application while it is pending. Seller product tools unlock when an
          administrator approves the account.
        </p>
        <Link href="/seller/onboarding">Review application</Link>
      </Card>
    );
  }
  const dashboard = await sellerRepository.getSellerDashboard(workspace.seller.id);
  const maxRevenue = Math.max(...dashboard.revenueSeries.map((month) => month.valueInPaise), 1);
  const maxOrders = Math.max(...dashboard.orderStatusSeries.map((status) => status.value), 1);
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p>Seller overview</p>
          <h1>Welcome back, {dashboard.storeName}</h1>
          <span>Live marketplace activity from your products and order items.</span>
        </div>
        <Link className={styles.primaryAction} href="/seller/products/new">
          <PackagePlus aria-hidden="true" size={18} />
          Create product
        </Link>
      </header>

      {dashboard.verificationStatus !== 'APPROVED' ? (
        <div className={styles.notice} role="status">
          <AlertTriangle aria-hidden="true" size={20} />
          <div>
            <strong>Store verification: {dashboard.verificationStatus.replaceAll('_', ' ')}</strong>
            <p>{verificationGuidance(dashboard.verificationStatus)}</p>
          </div>
        </div>
      ) : null}

      <section className={styles.metrics} aria-label="Seller performance metrics">
        {dashboard.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className={styles.analytics}>
        <Card className={styles.chartCard}>
          <header>
            <div>
              <p>Revenue overview</p>
              <h2>Last six months</h2>
            </div>
            <span>Order-item revenue</span>
          </header>
          <div className={styles.barChart} aria-label="Revenue by month">
            {dashboard.revenueSeries.map((month) => (
              <div className={styles.barColumn} key={month.label}>
                <span>{formatPrice(month.valueInPaise)}</span>
                <div
                  className={styles.revenueBar}
                  style={{ height: `${Math.max(4, (month.valueInPaise / maxRevenue) * 100)}%` }}
                />
                <strong>{month.label}</strong>
              </div>
            ))}
          </div>
        </Card>
        <Card className={styles.chartCard}>
          <header>
            <div>
              <p>Order status</p>
              <h2>Current workload</h2>
            </div>
          </header>
          {dashboard.orderStatusSeries.length ? (
            <div className={styles.statusChart}>
              {dashboard.orderStatusSeries.map((status) => (
                <div key={status.label}>
                  <span>{status.label.replaceAll('_', ' ')}</span>
                  <div>
                    <i style={{ width: `${(status.value / maxOrders) * 100}%` }} />
                  </div>
                  <strong>{status.value}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.muted}>Order activity will appear here after the first sale.</p>
          )}
        </Card>
      </section>

      <section className={styles.activity}>
        <Card className={styles.listCard}>
          <header>
            <div>
              <p>Recent orders</p>
              <h2>Latest activity</h2>
            </div>
          </header>
          {dashboard.recentOrders.length ? (
            <ul>
              {dashboard.recentOrders.map((order) => (
                <li key={`${order.orderNumber}-${order.productName}`}>
                  <div>
                    <strong>{order.productName}</strong>
                    <span>{order.orderNumber}</span>
                  </div>
                  <Badge tone={order.status === 'DELIVERED' ? 'success' : 'info'}>
                    {order.status.replaceAll('_', ' ')}
                  </Badge>
                  <strong>{formatPrice(order.totalInPaise)}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>No seller order items yet.</p>
          )}
        </Card>
        <Card className={styles.listCard}>
          <header>
            <div>
              <p>Product performance</p>
              <h2>Top products</h2>
            </div>
            <Link href="/seller/products">
              View products <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </header>
          {dashboard.topProducts.length ? (
            <ul>
              {dashboard.topProducts.map((product) => (
                <li key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.orderCount} units ordered</span>
                  </div>
                  <strong>{formatPrice(product.revenueInPaise)}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>Top products will appear after paid orders.</p>
          )}
        </Card>
        <Card className={styles.listCard}>
          <header>
            <div>
              <p>Inventory attention</p>
              <h2>Low-stock products</h2>
            </div>
          </header>
          {dashboard.lowStockProducts.length ? (
            <ul>
              {dashboard.lowStockProducts.map((product) => (
                <li key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.stock} units available</span>
                  </div>
                  <Link href={`/seller/products/${product.id}/inventory`}>Update stock</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>All products are above their low-stock thresholds.</p>
          )}
        </Card>
      </section>
    </div>
  );
}
