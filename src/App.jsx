import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Categories from './pages/Categories';
import Search from './pages/Search';
import Store from './pages/Store';
import Cart from './pages/Cart';
import Payment from './pages/Payment';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import ResetPassword from './pages/ResetPassword';
import SellerRegister from './pages/auth/SellerRegister';

// User Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import Orders from './pages/dashboard/Orders';
import OrderDetails from './pages/dashboard/OrderDetails';
import OrderTracking from './pages/dashboard/OrderTracking';
import Wishlist from './pages/dashboard/Wishlist';
import SaveForLater from './pages/dashboard/SaveForLater';
import Profile from './pages/dashboard/Profile';
import Settings from './pages/dashboard/Settings';
import Notifications from './pages/dashboard/Notifications';
import ReturnRefundRequest from './pages/dashboard/ReturnRefundRequest';
import SupportTickets from './pages/dashboard/SupportTickets';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminAddProduct from './pages/admin/AdminAddProduct';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSellers from './pages/admin/AdminSellers';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminReturnRequests from './pages/admin/AdminReturnRequests';
import AdminCategories from './pages/admin/AdminCategories';
import AdminAddCategory from './pages/admin/AdminAddCategory';
import AdminOptions from './pages/admin/AdminOptions';
import AdminAddOption from './pages/admin/AdminAddOption';
import AdminBrands from './pages/admin/AdminBrands';
import AdminAddBrand from './pages/admin/AdminAddBrand';
import AdminCommission from './pages/admin/AdminCommission';
import AdminCMS from './pages/admin/AdminCMS';
import AdminSupportTickets from './pages/admin/AdminSupportTickets';
import AdminPlatformSettings from './pages/admin/AdminPlatformSettings';
import AdminCoupons from './pages/admin/AdminCoupons';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerAddProduct from './pages/seller/SellerAddProduct';
import SellerEditProduct from './pages/seller/SellerEditProduct';
import SellerOrders from './pages/seller/SellerOrders';
import SellerReturnRequests from './pages/seller/SellerReturnRequests';
import SellerOrderDetail from './pages/seller/SellerOrderDetail';
import SellerSalesAnalytics from './pages/seller/SellerSalesAnalytics';
import SellerRevenue from './pages/seller/SellerRevenue';
import SellerMessaging from './pages/seller/SellerMessaging';
import SellerStoreProfile from './pages/seller/SellerStoreProfile';
import SellerPayoutSettings from './pages/seller/SellerPayoutSettings';
import SellerProductPerformance from './pages/seller/SellerProductPerformance';

// Support Pages
import HelpCenter from './pages/HelpCenter';
import FAQ from './pages/FAQ';
import UserProvider from './store/userContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminProtectedRoutes from './components/layout/AdminProtectedRoutes';
import { GoogleOAuthProvider } from '@react-oauth/google';
import SellerLogin from './pages/auth/SellerLogin';
import AdminLogin from './pages/auth/AdminLogin';
import AdminAcceptInvite from './pages/auth/AdminAcceptInvite';
import SellerProtectedRoutes from './components/layout/SellerProtectedRoute';
import PendingApproval from './pages/seller/PendingApproval';
import AdminEditProduct from './pages/admin/AdminEditProduct';
import AdminEditCategory from './pages/admin/AdminEditCategory';
import AdminEditBrand from './pages/admin/AdminEditBrand';
import AdminEditOption from './pages/admin/AdminEditOption';
import CartProvider from './store/cartContext';
import WishlistProvider from './store/wishlistContext';
import CheckoutPage from './features/checkout/pages/CheckoutPage';
import { Toaster } from 'react-hot-toast';
import UserMessages from './pages/dashboard/Messages';
import PlatformSettingsProvider from './store/platformSettingsContext';
import NotificationProvider from './store/notificationContext';

function App() {
  return (
    <PlatformSettingsProvider>
      <UserProvider>
        <NotificationProvider>
          <WishlistProvider>
            <CartProvider>
              <Router>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                }}
              />
              <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:category" element={<Products />} />
            <Route path="/search" element={<Search />} />
            <Route path="/store/:sellerSlug" element={<Store />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment" element={<Payment />} />

            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={
                <GoogleOAuthProvider clientId="856083765329-jt8t4fmri8ohos2j3tsltl9ld22clohj.apps.googleusercontent.com">
                  <Login />
                </GoogleOAuthProvider>
              } 
            />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp/:email" element={<VerifyOtp />} />
            <Route path="/reset-password/:email" element={<ResetPassword />} />

            {/* User Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/order-tracking" element={<OrderTracking />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/save-for-later" element={<SaveForLater />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/returns-refunds" element={<ReturnRefundRequest />} />
              <Route path="/support-tickets" element={<SupportTickets />} />
              <Route path="/messages" element={<UserMessages />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/accept-invite" element={<AdminAcceptInvite />} />
            <Route path='/admin' element={<AdminProtectedRoutes />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<Navigate to={'/admin'} />} />
              <Route path="notifications" element={<Notifications layout="admin" />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/add" element={<AdminAddProduct />} />
              <Route path="products/:id/edit" element={<AdminEditProduct />} />
              <Route path="products/:id/delete" element={<AdminEditProduct />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="analytics" element={<Navigate to="/admin" replace />} />
              <Route path="sellers" element={<AdminSellers />} />
              <Route path="disputes" element={<AdminDisputes />} />
              <Route path="return-requests" element={<AdminReturnRequests />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="categories/add" element={<AdminAddCategory />} />
              <Route path="categories/:id/edit" element={<AdminEditCategory />} />
              <Route path="options" element={<AdminOptions />} />
              <Route path="options/add" element={<AdminAddOption />} />
              <Route path="options/:id/edit" element={<AdminEditOption />} />
              <Route path="brands" element={<AdminBrands />} />
              <Route path="brands/add" element={<AdminAddBrand />} />
              <Route path="brands/:id/edit" element={<AdminEditBrand />} />
              <Route path="commission" element={<AdminCommission />} />
              <Route path="cms" element={<AdminCMS />} />
              <Route path="support-tickets" element={<AdminSupportTickets />} />
              <Route path="platform-settings" element={<AdminPlatformSettings />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="settings" element={<Navigate to="/admin/platform-settings" replace />} />
            </Route>

            {/* Seller Routes */}
            <Route path="/seller/register" element={<SellerRegister />} />
            <Route path="/seller/login" element={<SellerLogin />} />
            <Route path="/seller/pending-approval" element={<PendingApproval />} />
            <Route path="/seller" element={<SellerProtectedRoutes />}>
              <Route index element={<SellerDashboard />} />
              <Route path="dashboard" element={<Navigate to={'/seller'} />} />
              <Route path="notifications" element={<Notifications layout="seller" />} />
              <Route path="products" element={<SellerProducts />} />
              <Route path="products/add" element={<SellerAddProduct />} />
              <Route path="products/:id/edit" element={<SellerEditProduct />} />
              <Route path="orders" element={<SellerOrders />} />
              <Route path="returns" element={<SellerReturnRequests />} />
              <Route path="orders/:orderId" element={<SellerOrderDetail />} />
              <Route path="analytics" element={<SellerSalesAnalytics />} />
              <Route path="revenue" element={<SellerRevenue />} />
              <Route path="messaging" element={<SellerMessaging />} />
              <Route path="shipping" element={<Navigate to="/seller/orders" replace />} />
              <Route path="store-profile" element={<SellerStoreProfile />} />
              <Route path="payout-settings" element={<SellerPayoutSettings />} />
              <Route path="product-performance" element={<SellerProductPerformance />} />
              <Route path="settings" element={<SellerDashboard />} />
            </Route>

            {/* Support Routes */}
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/faq" element={<FAQ />} />
              </Routes>
              </Router>
            </CartProvider>
          </WishlistProvider>
        </NotificationProvider>
      </UserProvider>
    </PlatformSettingsProvider>
  );
}

export default App;
