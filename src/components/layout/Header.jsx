import { Link } from 'react-router-dom';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span>Free shipping on orders over $50</span>
              <span className="hidden md:inline">|</span>
              <span className="hidden md:inline">24/7 Customer Support</span>
            </div>
            <div className="flex items-center space-x-4">
              <select className="bg-transparent border-none text-white text-sm">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
              <select className="bg-transparent border-none text-white text-sm">
                <option>EN</option>
                <option>ES</option>
                <option>FR</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600">
            E-Commerce
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <SearchBar placeholder="Search for products, brands, and more..." />
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <Link to="/wishlist" className="hidden md:flex items-center space-x-1 text-gray-700 hover:text-primary-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm">Wishlist</span>
            </Link>
            <Link to="/cart" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm hidden md:inline">Cart</span>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="hidden md:inline-flex">
                Login
              </Button>
            </Link>
            <button className="md:hidden text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-8">
            <button className="py-4 px-2 text-gray-700 hover:text-primary-600 font-medium flex items-center space-x-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>All Categories</span>
            </button>
            <Link to="/" className="py-4 px-2 text-gray-700 hover:text-primary-600 font-medium">Home</Link>
            <Link to="/products" className="py-4 px-2 text-gray-700 hover:text-primary-600 font-medium">Products</Link>
            <Link to="/categories" className="py-4 px-2 text-gray-700 hover:text-primary-600 font-medium">Categories</Link>
            <Link to="/flash-sales" className="py-4 px-2 text-gray-700 hover:text-primary-600 font-medium">Flash Sales</Link>
            <Link to="/deals" className="py-4 px-2 text-gray-700 hover:text-primary-600 font-medium">Deals</Link>
            <Link to="/help" className="py-4 px-2 text-gray-700 hover:text-primary-600 font-medium">Help Center</Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
