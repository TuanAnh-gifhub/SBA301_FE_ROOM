// app/admin/packages/page.tsx

// Lùi 3 cấp (ra tới src) -> vào components -> vào Admin -> lấy file
import PackageManagement from '../../../components/Admin/PackageManagement';
/**
 * Page quản lý packages cho ADMIN
 * Route: /admin/packages
 */
export default function AdminPackagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PackageManagement />
    </div>
  );
}