import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  ChevronDown,
  Heart,
  LogOut,
  Package,
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Grid3X3,
  HelpCircle,
} from 'lucide-react';
import Button from '../common/Button';
import useUserContext from '../../hooks/useUserContext';
import authService from '../../services/auth.service';
import useCartContext from '../../hooks/useCartContext';
import useWishlistContext from '../../hooks/useWishlistContext';
import usePlatformSettings from '../../hooks/usePlatformSettings';
import useCategories from '../../hooks/useCategories';

const Header = () => {
  const token = authService.getToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserContext();
  const { cartItems } = useCartContext();
  const { wishlistCount } = useWishlistContext();
  const { settings } = usePlatformSettings();
  const { hierarchy: categories, loading: categoriesLoading } = useCategories();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const [expandedParents, setExpandedParents] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  
  const menuRef = useRef(null);
  const categoriesMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (categoriesMenuRef.current && !categoriesMenuRef.current.contains(event.target)) {
        setCategoriesMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogOut() {
    authService.clearAuthData();
    setMenuOpen(false);
    navigate('/login');
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const toggleParentCategory = (parentId) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });
  };

  const displayName = user?.fullName || user?.firstName || 'My Account';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="h-20 flex items-center justify-between gap-4">
          <Link to="/" className="text-xl md:text-2xl font-bold text-primary-700 whitespace-nowrap">
            {settings.siteName || 'E-Commerce'}
          </Link>

          <div className="hidden md:flex flex-1 max-w-2xl">
            <div className="w-full flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
              <input
                type="text"
                placeholder="Search"
                className="flex-1 px-4 py-2.5 focus:outline-none"
              />
              <button
                type="button"
                className="h-full px-4 bg-primary-900 text-white hover:bg-primary-800 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
    
          <div className="flex items-center gap-4 md:gap-6 text-sm font-semibold">
            {token && (
              <Link to="/wishlist" className="relative inline-flex items-center gap-1 text-gray-800 hover:text-primary-700">
                <Heart className="w-5 h-5" />
                <span className="hidden md:inline">Wishlist</span>
                {wishlistCount > 0 ? (
                  <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                ) : null}
              </Link>
            )}

            <Link to="/cart" className="relative inline-flex items-center gap-1 text-gray-800 hover:text-primary-700">
              <ShoppingBag className="w-5 h-5" />
              <span>Cart</span>
              {cartItems.length > 0 ? (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              ) : null}
            </Link>

            {!token ? (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Register</Button>
                </Link>
              </div>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-gray-900 hover:text-primary-700"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <span className="hidden md:inline">Welcome {displayName}</span>
                  <span className="md:hidden"><User className="w-5 h-5" /></span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {menuOpen ? (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 shadow-lg rounded-md py-2">
                    <Link to="/dashboard" className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                      <User className="w-4 h-4" /> My Account
                    </Link>
                    <Link to="/orders" className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                      <Package className="w-4 h-4" /> Orders
                    </Link>
                    <Link to="/wishlist" className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                      <Heart className="w-4 h-4" /> Wishlist
                    </Link>
                    <Link to="/save-for-later" className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                      <Bookmark className="w-4 h-4" /> Save for Later
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-12">
            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesMenuRef}>
              <button
                onClick={() => setCategoriesMenuOpen(!categoriesMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded transition-colors"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="font-medium">Categories</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {categoriesMenuOpen && !categoriesLoading && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 shadow-lg rounded-lg py-2 z-50 max-h-96 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category._id} className="group">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-2 text-gray-700 bg-gray-50"
                        onClick={() => toggleParentCategory(category._id)}
                      >
                        <div className="flex items-center gap-3">
                          {category.logo?.url && (
                            <img
                              src={category.logo.url}
                              alt={category.name}
                              className="w-6 h-6 rounded object-cover"
                              onError={(e) => {
                                e.target.src = `https://via.placeholder.com/24x24?text=${category.name.charAt(0)}`;
                              }}
                            />
                          )}
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{category.name}</span>
                            <span className="text-xs text-gray-500">Choose a subcategory</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {category.subcategories?.length > 0 && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {category.subcategories.length}
                            </span>
                          )}
                          <ChevronDown
                            className={`w-4 h-4 text-gray-500 transition-transform ${
                              expandedParents.has(category._id) ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>
                      
                      {category.subcategories?.length > 0 && expandedParents.has(category._id) && (
                        <div className="ml-6 border-l border-gray-200">
                          {category.subcategories.slice(0, 5).map((subcategory) => (
                            <Link
                              key={subcategory._id}
                              to={`/products?category=${subcategory._id}`}
                              className="block px-4 py-1 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                              onClick={() => setCategoriesMenuOpen(false)}
                            >
                              {subcategory.name}
                            </Link>
                          ))}
                          {category.subcategories.length > 5 && (
                            <Link
                              to={`/categories`}
                              className="block px-4 py-1 text-xs text-blue-600 hover:text-blue-800"
                              onClick={() => setCategoriesMenuOpen(false)}
                            >
                              View all {category.subcategories.length} subcategories
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <Link
                      to="/categories"
                      className="block px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => setCategoriesMenuOpen(false)}
                    >
                      View All Categories
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Main Navigation Links */}
            <div className="hidden md:flex items-center gap-8 ml-8">
              <Link 
                to="/" 
                className={`hover:text-blue-200 transition-colors ${isActiveRoute('/') ? 'text-blue-200 font-medium' : ''}`}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className={`hover:text-blue-200 transition-colors ${isActiveRoute('/products') ? 'text-blue-200 font-medium' : ''}`}
              >
                Products
              </Link>
              <Link 
                to="/categories" 
                className={`hover:text-blue-200 transition-colors ${isActiveRoute('/categories') ? 'text-blue-200 font-medium' : ''}`}
              >
                All Categories
              </Link>
              <Link 
                to="/help" 
                className={`hover:text-blue-200 transition-colors flex items-center gap-1 ${isActiveRoute('/help') ? 'text-blue-200 font-medium' : ''}`}
              >
                <HelpCircle className="w-4 h-4" />
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg" ref={mobileMenuRef}>
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex items-center border-2 border-blue-900 rounded-lg overflow-hidden">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 text-white"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Mobile Navigation */}
            <div className="space-y-2">
              <Link 
                to="/" 
                className="block py-2 text-gray-700 hover:text-blue-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className="block py-2 text-gray-700 hover:text-blue-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/categories" 
                className="block py-2 text-gray-700 hover:text-blue-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link 
                to="/help" 
                className="block py-2 text-gray-700 hover:text-blue-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Help Center
              </Link>
              
              {token && (
                <>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <Link 
                      to="/wishlist" 
                      className="block py-2 text-gray-700 hover:text-blue-900"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Wishlist ({wishlistCount})
                    </Link>
                    <Link 
                      to="/cart" 
                      className="block py-2 text-gray-700 hover:text-blue-900"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Cart ({cartItems.length})
                    </Link>
                    <Link 
                      to="/dashboard" 
                      className="block py-2 text-gray-700 hover:text-blue-900"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        handleLogOut();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 text-red-600 hover:text-red-800"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
              
              {!token && (
                <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
                  <Link 
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link 
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="primary" className="w-full">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
