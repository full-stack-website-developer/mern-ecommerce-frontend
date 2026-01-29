import { useState } from 'react';
import Rating from '../common/Rating';
import Badge from '../common/Badge';
import Button from '../common/Button';
import ProductImageGallery from './ProductImageGallery';

const ProductDetails = ({ product }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Images */}
      <div>
        <ProductImageGallery />
      </div>

      {/* Product Info */}
      <div>
        <div className="mb-4">
          <Badge variant="success">In Stock</Badge>
          <Badge variant="primary" className="ml-2">Best Seller</Badge>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {product?.name || 'Product Name'}
        </h1>

        <div className="flex items-center space-x-4 mb-4">
          <Rating rating={4.8} showNumber size="lg" />
          <span className="text-gray-600">(120 reviews)</span>
          <a href="#reviews" className="text-primary-600 hover:underline">
            See all reviews
          </a>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-4xl font-bold text-gray-900">
              ${product?.price || '99.99'}
            </span>
            {product?.originalPrice && (
              <>
                <span className="text-2xl text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
                <Badge variant="danger">
                  Save {Math.round((1 - product.price / product.originalPrice) * 100)}%
                </Badge>
              </>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-700">
            {product?.description || 'This is a high-quality product with excellent features. Perfect for everyday use and built to last.'}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex space-x-2">
              {['Black', 'White', 'Red', 'Blue'].map((color) => (
                <button
                  key={color}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-primary-600"
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size
            </label>
            <div className="flex space-x-2">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <button
                  key={size}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-primary-600"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                readOnly
                className="w-20 px-4 py-2 border border-gray-300 rounded-lg text-center"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 mb-6">
          <Button variant="primary" className="flex-1">
            Add to Cart
          </Button>
          <Button variant="outline">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Button>
        </div>

        {/* Shipping Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">Free shipping on orders over $50</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">30-day return policy</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">Secure payment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
