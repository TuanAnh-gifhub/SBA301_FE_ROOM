// app/packages/page.tsx

import PackageList from '../../components/PackageList';

/**
 * Page hiển thị danh sách packages cho USER
 * Route: /packages
 */
export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PackageList />
    </div>
  );
}