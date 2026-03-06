import { Link, useLocation } from 'react-router-dom';
import Button from '../common/Button';
import useNotificationContext from '../../hooks/useNotificationContext';

const SellerLayout = ({ children }) => {
  const location = useLocation();
  const { unreadCount } = useNotificationContext();
  
  const menuItems = [
    { path: '/seller/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/seller/products', label: 'My Products', icon: '📦' },
    { path: '/seller/orders', label: 'Orders', icon: '🛒' },
    { path: '/seller/returns', label: 'Returns', icon: '↩️' },
    { path: '/seller/analytics', label: 'Sales Analytics', icon: '📈' },
    { path: '/seller/revenue', label: 'Revenue', icon: '💰' },
    { path: '/seller/messaging', label: 'Messaging', icon: '💬' },
    { path: '/seller/store-profile', label: 'Store Profile', icon: '🏪' },
    { path: '/seller/payout-settings', label: 'Payout Settings', icon: '🏦' },
    { path: '/seller/product-performance', label: 'Product Performance', icon: '📊' },
    { path: '/seller/notifications', label: 'Notifications', icon: '🔔', hasUnreadBadge: true },
    { path: '/seller/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Seller Panel</h1>
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline">View Shop</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.hasUnreadBadge && unreadCount > 0 && (
                      <span className="ml-auto inline-flex min-w-5 h-5 px-1 items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SellerLayout;
