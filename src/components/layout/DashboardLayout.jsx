import { Link, useLocation } from 'react-router-dom';
import Button from '../common/Button';
import Header from './Header';
import useUserContext from '../../hooks/useUserContext';
import useNotificationContext from '../../hooks/useNotificationContext';

const DashboardLayout = ({ children }) => {
  const { user } = useUserContext();
  const { unreadCount } = useNotificationContext();
  const location = useLocation();
  
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/orders', label: 'My Orders', icon: '📦' },
    { path: '/order-tracking', label: 'Order Tracking', icon: '📍' },
    { path: '/wishlist', label: 'Wishlist', icon: '❤️' },
    { path: '/save-for-later', label: 'Save For Later', icon: '🔖' },
    { path: '/returns-refunds', label: 'Returns & Refunds', icon: '↩️' },
    { path: '/messages', label: 'Messaging', icon: '💬' },
    { path: '/support-tickets', label: 'Support Tickets', icon: '🎫' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
    { path: '/notifications', label: 'Notifications', icon: '🔔', hasUnreadBadge: true },
    ...(user?.role === 'seller' ? [{ path: '/seller', label: 'Seller Dashboard', icon: '📊' }] : []),
    user?.role === 'admin' && { path: '/admin', label: 'Admin Dashboard', icon: '📊' },
  ].filter(Boolean);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
              <div className="flex items-center space-x-4">
                <Link to="/">
                  <Button variant="outline">Back to Shop</Button>
                </Link>
              </div>
            </div>
          </div>
        </div> */}

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
    </>
  );
};

export default DashboardLayout;
