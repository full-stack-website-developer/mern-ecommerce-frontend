import { Link } from 'react-router-dom';
import Rating from '../common/Rating';
import Badge from '../common/Badge';
import Button from '../common/Button';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <Link to={`/products/${product?.id || '1'}`}>
        <div className="relative">
          <img
            src={product?.image || 'https://via.placeholder.com/300x300'}
            alt={product?.name || 'Product'}
            className="w-full h-64 object-cover"
          />
          {product?.discount && (
            <Badge variant="danger" className="absolute top-2 left-2">
              -{product.discount}%
            </Badge>
          )}
          {product?.isNew && (
            <Badge variant="success" className="absolute top-2 right-2">
              New
            </Badge>
          )}
          <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/products/${product?.id || '1'}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600">
            {product?.name || 'Product Name'}
          </h3>
        </Link>
        
        <div className="flex items-center space-x-2 mb-2">
          <Rating rating={product?.rating || 4.5} showNumber />
          <span className="text-sm text-gray-500">({product?.reviews || 120})</span>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">
            ${product?.price || '99.99'}
          </span>
          {product?.originalPrice && (
            <span className="text-lg text-gray-500 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button variant="primary" className="flex-1">
            Add to Cart
          </Button>
          <Button variant="outline">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
