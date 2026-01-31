import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Categories from './pages/Categories';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import ResetPassword from './pages/ResetPassword';

// User Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import Orders from './pages/dashboard/Orders';
import OrderDetails from './pages/dashboard/OrderDetails';
import Wishlist from './pages/dashboard/Wishlist';
import Profile from './pages/dashboard/Profile';
import Notifications from './pages/dashboard/Notifications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';

// Support Pages
import HelpCenter from './pages/HelpCenter';
import FAQ from './pages/FAQ';
import UserProvider from './store/userContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminProtectedRoutes from './components/layout/AdminProtectedRoutes';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:category" element={<Products />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
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
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminProtectedRoutes />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/categories" element={<AdminProducts />} />
            <Route path="/admin/coupons" element={<AdminProducts />} />
            <Route path="/admin/settings" element={<AdminDashboard />} />
          </Route>

          {/* Seller Routes */}
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/orders" element={<SellerOrders />} />
          <Route path="/seller/analytics" element={<SellerDashboard />} />
          <Route path="/seller/settings" element={<SellerDashboard />} />

          {/* Support Routes */}
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
