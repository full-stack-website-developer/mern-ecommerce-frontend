import { Link, useLocation } from 'react-router-dom';
import Button from '../common/Button';
import useNotificationContext from '../../hooks/useNotificationContext';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const { unreadCount } = useNotificationContext();
  
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Products', icon: '📦' },
    { path: '/admin/orders', label: 'Orders', icon: '🛒' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/sellers', label: 'Sellers', icon: '🏪' },
    { path: '/admin/disputes', label: 'Disputes', icon: '⚖️' },
    { path: '/admin/return-requests', label: 'Return Requests', icon: '↩️' },
    { path: '/admin/categories', label: 'Categories', icon: '📁' },
    { path: '/admin/options', label: 'Options', icon: '⚙️' },
    { path: '/admin/brands', label: 'Brands', icon: '🏷️' },
    { path: '/admin/commission', label: 'Commission', icon: '💰' },
    { path: '/admin/cms', label: 'CMS', icon: '🖼️' },
    { path: '/admin/support-tickets', label: 'Support Tickets', icon: '🎫' },
    { path: '/admin/notifications', label: 'Notifications', icon: '🔔', hasUnreadBadge: true },
    { path: '/admin/platform-settings', label: 'Platform Settings', icon: '⚙️' },
    { path: '/admin/coupons', label: 'Coupons', icon: '🎫' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline">View Site</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
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
          <main className="lg:col-span-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
