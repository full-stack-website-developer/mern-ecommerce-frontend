import AdminLayout from '../../components/layout/AdminLayout';
import ProductForm from '../../features/product/components/ProductForm';

const AdminAddProduct = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add Product</h1>
        </div>
        <ProductForm />
      </div>
    </AdminLayout>
  );
};

export default AdminAddProduct;