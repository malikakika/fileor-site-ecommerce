import { useState } from 'react';
import AdminProductsCreateSection from './adminProductsCreateSection';
import AdminProductsListSection from './adminProductsListSection';
import AdminDesignsSection from './adminDesignsSection';
import AdminSupportSection from './adminSupportSection';
import AdminUsersListSection from './adminUsersListSection';
import AdminOrdersSection from './adminOrdersSection';

export default function AdminPage() {
  const [reloadKey, setReloadKey] = useState(0);
  return (
    <div className="w-full px-6 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-gray-600">
          Gère les produits, les designs et le support client.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:gap-8 max-w-screen-2xl">
        <section className="col-span-1">
          <AdminProductsListSection reloadKey={reloadKey} />
        </section>
        <section className="col-span-1">
          <AdminOrdersSection />
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="col-span-1">
            <AdminProductsCreateSection
              onCreated={() => setReloadKey((k) => k + 1)}
            />
          </div>

          <div className="col-span-1">
            <AdminDesignsSection />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="col-span-1">
            <AdminUsersListSection />
          </div>

          <div className="col-span-1">
            <AdminSupportSection />
          </div>
        </section>
      </div>
    </div>
  );
}
