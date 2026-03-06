import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import ProductForm from '../../features/product/components/ProductForm';
import FullPageLoader from '../../components/common/FullPageLoader';
import { useProduct } from '../../features/product/hooks/useProduct';

const AdminEditProduct = () => {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);

  if (loading) {
    return <FullPageLoader />;
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Error loading product: {error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
        </div>
        <ProductForm product={product} id={id} />
      </div>
    </AdminLayout>
  );
};

export default AdminEditProduct;