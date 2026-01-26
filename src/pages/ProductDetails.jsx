import MainLayout from '../components/layout/MainLayout';
import ProductDetails from '../components/product/ProductDetails';
import ProductReviews from '../components/product/ProductReviews';
import ProductList from '../components/product/ProductList';
import Breadcrumb from '../components/common/Breadcrumb';
import Tabs from '../components/common/Tabs';

const ProductDetailsPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Product Name', href: '/products/1' },
          ]}
        />

        <div className="mb-8">
          <ProductDetails />
        </div>

        {/* Product Tabs */}
        <div className="mb-12">
          <Tabs
            tabs={['Description', 'Specifications', 'Reviews', 'Shipping']}
            activeTab={0}
          >
            <div className="mt-6">
              <div className="prose max-w-none">
                <h3>Product Description</h3>
                <p>
                  This is a detailed description of the product. It includes all the features,
                  benefits, and important information that customers need to know before making
                  a purchase decision.
                </p>
                <ul>
                  <li>Feature 1: Description of feature</li>
                  <li>Feature 2: Description of feature</li>
                  <li>Feature 3: Description of feature</li>
                </ul>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="mb-12">
          <ProductReviews />
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-3xl font-bold mb-8">Related Products</h2>
          <ProductList />
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetailsPage;
