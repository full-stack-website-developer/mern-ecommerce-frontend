import { useParams } from 'react-router-dom';
import SellerLayout from '../../components/layout/SellerLayout';
import ProductForm from '../../features/product/components/ProductForm';
import FullPageLoader from '../../components/common/FullPageLoader';
import { useProduct } from '../../features/product/hooks/useProduct';
import toast from 'react-hot-toast';

const SellerEditProduct = () => {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);

  if (loading) {
    return <FullPageLoader />;
  }

  if (error) {
    return (
      <SellerLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Error loading product: {error}</p>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
        </div>
        <ProductForm
          product={product}
          id={id}
          mode="seller"
          successPath="/seller/products"
          cancelPath="/seller/products"
          onSuccess={() => toast.success('Product updated successfully')}
        />
      </div>
    </SellerLayout>
  );
};

export default SellerEditProduct;
