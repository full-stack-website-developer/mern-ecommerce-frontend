import ProductCard from './ProductCard';
import Carousel from '../common/Carousel';

const ProductList = ({ products = [], variant = 'grid', cardProps = {} }) => {
  if (variant === 'horizontal') {
    return (
      <Carousel
        ariaLabel="Products carousel"
        viewportClassName="px-1"
        itemClassName="min-w-[280px] max-w-[280px]"
      >
        {products.map((product) => (
          <ProductCard key={product.id || product._id} product={product} {...cardProps} />
        ))}
      </Carousel>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id || product._id} product={product} {...cardProps} />
      ))}
    </div>
  );
};

export default ProductList;
